#!/usr/bin/env node

/**
 * Script to package Lambda functions for direct upload to AWS Lambda
 * Usage: node package-lambda.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ZIP_FILE = 'lambda-deployment.zip';
const DIST_DIR = 'dist';

function exec(command, options = {}) {
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit', ...options });
}

function removeDir(dir) {
  if (fs.existsSync(dir)) {
    console.log(`Removing ${dir}...`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function removeFile(file) {
  if (fs.existsSync(file)) {
    console.log(`Removing ${file}...`);
    fs.unlinkSync(file);
  }
}

try {
  console.log('📦 Packaging Lambda functions for deployment...\n');

  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  removeDir(DIST_DIR);
  removeDir('node_modules');
  removeFile(ZIP_FILE);

  // Install all dependencies (needed for TypeScript build)
  console.log('\n📥 Installing all dependencies...');
  exec('npm install', { cwd: __dirname });

  // Build TypeScript
  console.log('\n🔨 Building TypeScript...');
  exec('npm run build', { cwd: __dirname });

  // Check if dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    throw new Error('Build failed: dist directory not found');
  }

  // Install production dependencies only for deployment
  console.log('\n📥 Installing production dependencies for deployment...');
  exec('npm install --production', { cwd: __dirname });

  // Copy node_modules to dist (Lambda needs them at root level)
  console.log('\n📋 Copying node_modules to dist...');
  if (fs.existsSync('node_modules')) {
    exec(`cp -r node_modules ${DIST_DIR}/`, { cwd: __dirname });
  }

  // Create zip file
  console.log('\n🗜️  Creating zip file...');
  exec(`cd ${DIST_DIR} && zip -r ../${ZIP_FILE} . -q`, { cwd: __dirname });

  // Clean up node_modules from dist
  console.log('\n🧹 Cleaning up...');
  removeDir(`${DIST_DIR}/node_modules`);

  const zipPath = path.join(__dirname, ZIP_FILE);
  const stats = fs.statSync(zipPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n✅ Done! Created lambda-deployment.zip');
  console.log(`📦 Size: ${sizeMB} MB\n`);
  console.log('📤 Next steps:');
  console.log('   1. Go to AWS Lambda Console');
  console.log('   2. Create a new function or select existing');
  console.log('   3. Upload lambda-deployment.zip');
  console.log('   4. Set handler to: handlers.health.handler (or any other handler)');
  console.log('   5. Set runtime to: Node.js 20.x');
  console.log('   6. Configure environment variables (see ENV_VARS.md)');
  console.log('   7. Set timeout to: 30 seconds');
  console.log('   8. Set memory to: 256 MB');
  console.log('');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}

