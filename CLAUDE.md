# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vision4-seam is a legacy demo application simulating a small enterprise Java EE system. It manages persons and locations with a many-to-many relationship between them.

**Stack:** JBoss Seam 2.2.2.Final, RichFaces 3.3.4.Final, JSF 1.2 (Facelets 1.1), JPA 2.0, Hibernate 3.3.0.SP1 (bundled), deployed on JBoss AS 7.1.1. The React frontend uses TypeScript, Tailwind CSS 4, and Vite.

## Build and Deploy

### Quick Start (recommended)

```bash
# Start JBoss AS 7.1.1 using the local environment
./start-jboss.sh

# In a separate terminal: build and deploy as WAR (default)
./build-deploy.sh

# Or: build and deploy as EAR
./build-deploy.sh --ear
```

### Scripts

- **`start-jboss.sh`** — Starts JBoss AS 7.1.1 using the local Java 7 and JBoss installation. Automatically stops any running instance, cleans stale deployment markers, and starts with port offset 100.
- **`build-deploy.sh`** — Builds the React frontend (`npm run build`), builds WAR + EAR using the local Maven (`local/apache-maven-3.8.7`), and deploys to local JBoss. Use `--ear` flag for EAR deployment.

### Deployment Modes

- **WAR (default):** Fat WAR with all libraries in `WEB-INF/lib`. Deployed as `vision4-seam.war`.
- **EAR (`--ear`):** Skinny WAR with empty `WEB-INF/lib`. All libraries in `EAR/lib/`. Deployed as `vision4-seam.ear`.

### Manual Build and Deploy

```bash
# Build the React frontend
cd war/frontend && npm run build && cd ../..

# Build WAR + EAR (requires Maven 3.x; runs on Java 17 for compilation, targets Java 7 bytecode)
mvn clean package

# Deploy WAR to local JBoss AS 7.1.1
cp war/target/vision4-seam.war local/jboss-as-7.1.1.Final/standalone/deployments/

# Or deploy EAR
cp ear/target/vision4-seam.ear local/jboss-as-7.1.1.Final/standalone/deployments/
```

The application is accessible at:
- **JSF app:** `http://localhost:8180/vision4-seam/home.seam`
- **React app:** `http://localhost:8180/vision4-seam/app/`

Uses the built-in H2 in-memory datasource (`java:jboss/datasources/ExampleDS`). Schema is auto-created on deploy (`hibernate.hbm2ddl.auto=create-drop`). Seed data loaded from `war/src/main/resources/import.sql`.

**Note:** JBoss AS 7.1.1 on Java 7 has limited PermGen space. After several hot-redeployments, PermGen may be exhausted causing deployment failures. Restart JBoss (`./start-jboss.sh`) to resolve.

### Local Runtime Environment

JBoss AS 7.1.1 and Zulu Java 7 are bundled in the `local/` directory:

```
local/
  jboss-as-7.1.1.Final/    # JBoss AS 7.1.1 application server
  zulu7.56.0.11-ca-jdk7.0.352-linux_x64/   # Zulu JDK 7 (runtime)
  apache-maven-3.8.7/      # Apache Maven 3.8.7 (build)
```

The local JBoss installation has these patches applied:
- `jboss-modules.jar` replaced with 1.1.5.GA (fixes `__redirected.__SAXParserFactory` NPE on modern JVMs)
- `standalone.conf` has JAXP workaround system properties and `JAVA_HOME` pointing to the local Zulu Java 7
- Runs with port offset 100 (port 8180) to coexist with other instances on port 8080

## Architecture

Two-layer architecture: **Seam POJO action components** (UI/conversation logic) + **@Stateless EJB DataService** (persistence).

### Key Patterns

- **Action components** are Seam POJOs (`@Name`, `@Scope`) — not CDI beans, not EJBs
- **DataService** is a `@Stateless` EJB with `@PersistenceContext` — the only bean that touches the EntityManager
- Action components obtain DataService via **manual JNDI lookup**: `new InitialContext().lookup("java:module/DataService")`
- This pattern avoids Seam 2's incompatibility with JBoss AS 7's EJB proxy mechanism (Seam `@In` injection of EJBs causes "value of context variable is not an instance of the component" errors)
- **Conversation scope** (`@Begin`/`@End`) on edit actions maintains state across AJAX requests (e.g., adding/removing locations before saving)
- **Page actions** in `pages.xml` call `init()` methods when pages load, with request params bound to component fields
- Navigation uses Seam's `<s:link>` with `propagation="none"` in menus to avoid leaking conversations
- URL pattern is `*.seam` (mapped in `web.xml`)
- JSF 1.2 `f:selectItems` does NOT support `var`/`itemLabel`/`itemValue` attributes — action beans must return `List<SelectItem>` instead
- Lazy-loaded collections (e.g., `Person.locations`) must be fetched eagerly via `JOIN FETCH` in JPQL queries since the persistence context closes when DataService methods return

### Source Layout

```
pom.xml                         # Parent POM (multi-module: war, ear)
start-jboss.sh                  # Start local JBoss AS 7.1.1
build-deploy.sh                 # Build and deploy (--ear for EAR mode)

war/                            # WAR module
  pom.xml                       # WAR packaging
  frontend/                     # React SPA (TypeScript, Vite, Tailwind CSS 4)
    src/
      api/client.ts             # Typed API base client (base URL: /vision4-seam/api)
      api/dashboardApi.ts       # Dashboard API (fetches aggregated stats)
      components/Layout.tsx     # App layout (hides chrome when embedded in JSF iframe)
      pages/                    # Page components (TSX): HomePage, DashboardPage, PersonListPage, etc.
      context/AuthContext.tsx    # Auth context with typed hooks
      types.ts                  # Shared TypeScript interfaces (PersonDto, LocationDto, etc.)
      App.css                   # Tailwind CSS 4 theme (@theme tokens + @layer component classes)
    tsconfig.json               # TypeScript config (strict mode, react-jsx)
    vite.config.ts              # Vite config (base: /vision4-seam/app/, dev proxy, Tailwind plugin)
  src/main/java/com/vision/demo/
    model/                      # JPA entities: Person, Location, LocationState enum
    action/                     # Seam POJO action components
    service/                    # @Stateless EJB: DataService (all persistence operations)
    rest/                       # JAX-RS REST resources: PersonResource, LocationResource, DashboardResource, AuthResource
  src/main/webapp/
    layout/template.xhtml       # Facelets master template (header, menu, footer, React toggle)
    home.xhtml                  # Landing page
    personEdit.xhtml            # Create/edit person with location assignment
    personList.xhtml            # Person list with rich:dataTable
    personReact.xhtml           # Person list via embedded React iframe
    locationEdit.xhtml          # Create/edit location
    locationList.xhtml          # Location list with rich:dataTable
    locationReact.xhtml         # Location list via embedded React iframe
    dashboardReact.xhtml        # Dashboard via embedded React iframe
    about.xhtml                 # Application info page
    css/style.css               # All application styles
    WEB-INF/
      components.xml            # Seam config (jndi-pattern, transaction, conversation)
      pages.xml                 # Page actions and parameter bindings
      faces-config.xml          # Facelets ViewHandler registration
      web.xml                   # Servlets, filters, RichFaces skin config
      jboss-deployment-structure.xml  # WAR-level: excludes JBoss AS 7 built-in JSF 2.0

ear/                            # EAR module
  pom.xml                       # EAR packaging (skinnyWars, all libs in EAR lib/)
  src/main/application/META-INF/
    jboss-deployment-structure.xml  # EAR-level: JSF 2.0 exclusion + module dependencies

local/                          # Local runtime environment (not in git)
  apache-maven-3.8.7/          # Apache Maven 3.8.7 (build)
  jboss-as-7.1.1.Final/        # JBoss AS 7.1.1 application server
  zulu7.56.0.11-ca-jdk7.0.352-linux_x64/  # Zulu JDK 7
```

### Entity Relationship

`Person` ←ManyToMany→ `Location` via `person_location` join table. A person can be assigned multiple active locations. The `LocationState` enum (`ACTIVE`/`NOT_ACTIVE`) controls location availability.

## JBoss AS 7 Compatibility

Seam 2.2.2 was designed for JBoss AS 4/5/6. Running on JBoss AS 7.1.1 requires:

- `jboss-deployment-structure.xml` excludes the built-in JSF 2.0 modules so bundled JSF 1.2 is used
- JSF 1.2 RI (Mojarra), Facelets 1.1, and RichFaces 3.3.4 are bundled
- Hibernate 3.3.0.SP1 bundled for Seam 2 proxy compatibility (JBoss AS 7 ships Hibernate 4 which breaks Seam's `HibernateSessionProxy`)
- `jboss-seam-jul.jar` excluded to avoid StackOverflowError from logging recursion (via `packagingExcludes` in both WAR and EAR plugins)
- Maven repositories `jboss-public` and `jboss-deprecated` are required for resolving legacy artifacts
- Maven plugin versions must be 3.x+ compatible (e.g., maven-war-plugin 3.4.0, maven-compiler-plugin 3.11.0) since Maven runs on Java 17

### EAR Packaging Notes

- EAR uses `skinnyWars=true`: all libraries are in `EAR/lib/`, WAR `WEB-INF/lib` is empty
- The EAR-level `jboss-deployment-structure.xml` (schema 1.1) excludes JSF 2.0 at the EAR deployment level so bundled JSF 1.2 from `EAR/lib/` is used everywhere
- `jboss-seam.jar` in `EAR/lib/` resolves the `VFSScanner → AbstractScanner` ClassNotFoundException that occurs when JBoss AS 7's implicit `org.jboss.integration.ext-content` module tries to link against Seam classes at the EAR-level classloader
- WAR sub-deployment inherits libraries from `EAR/lib/` and adds JAX-RS/RESTEasy/Jackson module dependencies

## RichFaces / JSF Notes

- Tag namespaces: `a4j` = `http://richfaces.org/a4j`, `rich` = `http://richfaces.org/rich`, `s` = `http://jboss.com/products/seam/taglib`
- RichFaces 3.x uses `reRender` (camelCase), not `render` as in RF 4.x
- AJAX updates use `<a4j:commandButton>` with `reRender` pointing to component IDs
- `<rich:calendar>` provides date picker; `<rich:dataTable>` provides sortable/pageable tables
- JSF 1.2 has no `<h:head>`/`<h:body>` — use plain HTML `<head>`/`<body>` inside `<f:view>`

## React Frontend

### TypeScript

All React code is TypeScript (`.ts`/`.tsx`). Shared interfaces live in `war/frontend/src/types.ts` (`PersonDto`, `LocationDto`, `User`, `DashboardData`, etc.). The API client (`api/client.ts`) provides a generic `apiRequest<T>()` function. The build script runs `tsc --noEmit` before `vite build` to enforce type-checking.

### Tailwind CSS 4

Styling uses Tailwind CSS 4 via the `@tailwindcss/vite` plugin. Configuration is CSS-first (no `tailwind.config.js`).

**Theme** (`App.css`):
- `@theme` block defines custom design tokens: `brand-dark`, `brand-medium`, `brand-border`, `brand-muted`, `accent`
- `@layer components` defines semantic CSS classes that compose Tailwind utilities via `@apply`

**Key component classes** (defined in `App.css`):
- **Layout:** `app-shell`, `app-header`, `app-main`, `app-footer`, `nav-link`, `header-input`, `header-select`, `role-badge`
- **Buttons:** `btn`, `btn-sm`, `btn-secondary`, `btn-danger`
- **Tables:** `data-table` (with nested `th`/`td`/`tr:hover` rules), `table-empty`
- **Forms:** `edit-form`, `form-group`, `form-label`, `form-input`, `form-actions`, `checkbox-group`, `checkbox-label`
- **Cards:** `card`, `dash-card`, `dash-card-value`, `dash-card-label`, `dash-grid`, `dash-section`, `dash-two-col`
- **Typography:** `page-title`, `page-header`, `section-title`, `sub-title`, `text-muted`, `text-link`
- **Messages:** `error-msg`, `loading`
- **Charts:** `chart-with-legend`, `chart-legend`, `legend-item`, `legend-color`, `bar-chart`, `bar-row`, `bar-label`, `bar-track`, `bar-fill`, `bar-value`

**Note:** Tailwind CSS 4 does not allow `@apply` with custom classes defined in the same `@layer` — only Tailwind utility classes can be used with `@apply`.
