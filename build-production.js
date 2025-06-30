#!/usr/bin/env node

/**
 * Production build script for Render deployment
 * Uses existing vite config with production environment variables
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🚀 Starting production build...');

try {
  // Step 1: Build frontend using existing config with production env
  console.log('📦 Building frontend...');
  const { stdout: viteOutput, stderr: viteError } = await execAsync(
    'npx vite build --config vite.config.ts',
    { 
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

  // Step 2: Build backend
  console.log('🔧 Building backend...');
  const { stdout: esbuildOutput, stderr: esbuildError } = await execAsync(
    'npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist'
  );

  if (esbuildError && !esbuildError.includes('warning')) {
    console.warn('Build warnings:', esbuildError);
  }
  console.log('✅ Backend build completed');

  console.log('🎉 Production build completed successfully!');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}