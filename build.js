// Simple build script for Vercel deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the build directories exist
makeDir('./dist');
makeDir('./dist/public');

// Copy the static HTML file to the output directory
fs.copyFileSync('./index.html', './dist/public/index.html');

// Create a simple index.js file in dist for backward compatibility
fs.writeFileSync('./dist/index.js', `
// This file serves as a compatibility layer for imports
import { app } from '../server/index.js';
export { app };
`);

console.log('✅ Build completed successfully!');

// Helper function to create directory if it doesn't exist
function makeDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}
