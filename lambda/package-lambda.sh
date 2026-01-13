#!/bin/bash

# Script to package Lambda functions for direct upload
# This creates a zip file ready for AWS Lambda console upload

set -e

echo "📦 Packaging Lambda functions for deployment..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -f lambda-deployment.zip

# Install all dependencies (including dev dependencies for TypeScript)
echo "📥 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Install production dependencies only for packaging
echo "📋 Installing production dependencies..."
npm install --production --no-save

# Create deployment package
echo "📦 Creating deployment package..."

# Create zip with dist files and node_modules
zip -r lambda-deployment.zip dist node_modules package.json -q

# Clean up - restore dev dependencies
echo "🔄 Restoring dev dependencies..."
npm install

echo "✅ Done! Created lambda-deployment.zip"
echo ""
echo "📦 Package contents:"
echo "   - dist/ (compiled TypeScript)"
echo "   - node_modules/ (production dependencies)"
echo "   - package.json"
echo ""
echo "📤 Next steps:"
echo "   1. Download lambda-deployment.zip from lambda/ directory"
echo "   2. Go to AWS Lambda Console"
echo "   3. Create a new function or select existing"
echo "   4. Upload lambda-deployment.zip"
echo "   5. Set handler to: handlers.router.handler (for Function URL)"
echo "      OR handlers.health.handler (for individual function)"
echo "   6. Set runtime to: Node.js 20.x"
echo "   7. Configure environment variables:"
echo "      - USERS_TABLE=animal-detective-users-dev"
echo "      - ANALYTICS_TABLE=animal-detective-analytics-dev"
echo "      - GAME_EVENTS_TABLE=animal-detective-game-events-dev"
echo "      - SESSIONS_TABLE=animal-detective-sessions-dev"
echo "      - ANIMAL_INTERACTIONS_TABLE=animal-detective-animal-interactions-dev"
echo ""
echo "📁 File location: $(pwd)/lambda-deployment.zip"
echo ""
