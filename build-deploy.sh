#!/bin/bash
# Build the React frontend and Java application, then deploy to local JBoss
# Usage: ./build-deploy.sh [--ear]
#   (default)  Build and deploy as WAR (fat WAR with all libs in WEB-INF/lib)
#   --ear      Build and deploy as EAR (skinny WAR, all libs in EAR lib/)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
JBOSS_HOME="$SCRIPT_DIR/local/jboss-as-7.1.1.Final"
MVN_HOME="$SCRIPT_DIR/local/apache-maven-3.8.7"
DEPLOY_DIR="$JBOSS_HOME/standalone/deployments"
MVN="$MVN_HOME/bin/mvn"

echo "=== Building React frontend ==="
cd "$PROJECT_DIR/war/frontend"
npm run build

echo ""
echo "=== Building modules (WAR + EAR) ==="
cd "$PROJECT_DIR"
"$MVN" clean package -q

# Remove any previous deployment (war or ear)
rm -f "$DEPLOY_DIR/vision4-seam.ear" "$DEPLOY_DIR/vision4-seam.ear.deployed" "$DEPLOY_DIR/vision4-seam.ear.failed" "$DEPLOY_DIR/vision4-seam.ear.undeployed"

echo ""
echo "=== Deploying EAR to JBoss ==="
cp "$PROJECT_DIR/ear/target/vision4-seam.ear" "$DEPLOY_DIR/"
ARTIFACT="vision4-seam.ear"

echo ""
echo "Waiting for deployment..."
for i in $(seq 1 30); do
    if [ -f "$DEPLOY_DIR/$ARTIFACT.deployed" ]; then
        echo "Deployed successfully ($DEPLOY_MODE)."
        exit 0
    fi
    if [ -f "$DEPLOY_DIR/$ARTIFACT.failed" ]; then
        echo "ERROR: Deployment failed. Check server log:"
        echo "  $JBOSS_HOME/standalone/log/server.log"
        exit 1
    fi
    sleep 1
done

echo "WARNING: Deployment status unknown after 30s. Check server log."
