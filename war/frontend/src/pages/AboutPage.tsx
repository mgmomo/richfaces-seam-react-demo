export default function AboutPage() {
  return (
    <div>
      <h2 className="page-title">About Vision4 Seam Demo</h2>

      <p className="mb-4">
        This application is a demonstration of a small legacy Java EE application.
        It simulates a typical enterprise application from the JBoss Seam era,
        using the component-based development model that was prevalent in the late 2000s.
      </p>

      <div className="card mt-4">
        <h3 className="section-title">Technology Stack</h3>
        <dl>
          <dt><strong>Application Server</strong></dt>
          <dd className="ml-4 mb-2">JBoss AS 7.1.1.Final</dd>
          <dt><strong>Web Framework</strong></dt>
          <dd className="ml-4 mb-2">JBoss Seam 2.2.2.Final</dd>
          <dt><strong>UI Component Library</strong></dt>
          <dd className="ml-4 mb-2">RichFaces 3.3.4.Final</dd>
          <dt><strong>View Technology</strong></dt>
          <dd className="ml-4 mb-2">JavaServer Faces (JSF) 1.2 with Facelets</dd>
          <dt><strong>Persistence</strong></dt>
          <dd className="ml-4 mb-2">JPA 2.0 with Hibernate 4 (provided by JBoss AS 7)</dd>
          <dt><strong>Database</strong></dt>
          <dd className="ml-4 mb-2">H2 (embedded, in-memory)</dd>
          <dt><strong>Build Tool</strong></dt>
          <dd className="ml-4 mb-2">Apache Maven</dd>
          <dt><strong>React Frontend</strong></dt>
          <dd className="ml-4 mb-2">React 19, React Router, Vite, Tailwind CSS 4</dd>
        </dl>
      </div>

      <div className="card mt-4">
        <h3 className="section-title">Application Features</h3>
        <ul className="ml-6 mt-2 list-disc space-y-1">
          <li><strong>Person Management</strong> — Create, edit, and delete people with first name, last name, and date of birth.</li>
          <li><strong>Location Management</strong> — Create, edit, and delete locations with name, address, zip code, and active/not active status.</li>
          <li><strong>Person-Location Assignment</strong> — Assign one or more locations to a person using a many-to-many relationship.</li>
        </ul>
      </div>

      <div className="card mt-4">
        <h3 className="section-title">Application Information</h3>
        <dl>
          <dt><strong>Version</strong></dt>
          <dd className="ml-4">1.0.0-SNAPSHOT</dd>
        </dl>
      </div>
    </div>
  );
}
