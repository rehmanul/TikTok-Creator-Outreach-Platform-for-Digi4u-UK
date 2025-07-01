#!/usr/bin/env node

/**
 * Production build script for Render deployment
 * Uses existing vite config with production environment variables
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

console.log('🚀 Starting production build...');

try {
  // Ensure we're in the correct directory
  console.log('📍 Current directory:', process.cwd());
  
  // Step 1: Build frontend using existing config with production env
  console.log('📦 Building frontend...');
  const { stdout: viteOutput, stderr: viteError } = await execAsync(
    'npx vite build',
    { 
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        REPL_ID: undefined, // This will disable Replit plugins
        VITE_NODE_ENV: 'production'
      }
    }
  );

  if (viteError && !viteError.includes('warning')) {
    console.warn('Build warnings:', viteError);
  }
  console.log('✅ Frontend build completed');
  console.log('Frontend output:', viteOutput);

  // Step 2: Build backend
  console.log('🔧 Building backend...');
  const { stdout: esbuildOutput, stderr: esbuildError } = await execAsync(
    'npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist'
  );

  if (esbuildError && !esbuildError.includes('warning')) {
    console.warn('Build warnings:', esbuildError);
  }
  console.log('✅ Backend build completed');
  console.log('Backend output:', esbuildOutput);

  console.log('🎉 Production build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}