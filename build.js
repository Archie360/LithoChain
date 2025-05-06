// Build script for Vercel deployment
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Make sure dist and dist/public directories exist
const distDir = path.join(__dirname, 'dist');
const publicDir = path.join(distDir, 'public');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Build frontend
console.log('Building frontend...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
} catch (error) {
  console.error('Frontend build failed:', error);
  process.exit(1);
}

// Build backend
console.log('Building backend...');
try {
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
} catch (error) {
  console.error('Backend build failed:', error);
  process.exit(1);
}

console.log('Build completed successfully!');
