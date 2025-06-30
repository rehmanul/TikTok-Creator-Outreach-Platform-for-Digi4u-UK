#!/usr/bin/env node

/**
 * Production build script for Render deployment
 * Bypasses vite.config.ts issues by using minimal configuration
 */

import { build } from 'vite';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting production build...');

// Step 1: Build frontend with minimal config
console.log('📦 Building frontend...');
try {
  await build({
    root: path.resolve(__dirname, 'client'),
    build: {
      outDir: path.resolve(__dirname, 'dist/public'),
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client', 'src'),
        '@shared': path.resolve(__dirname, 'shared'),
        '@assets': path.resolve(__dirname, 'attached_assets'),
      },
    },
    plugins: [
      // Only include essential React plugin
      (await import('@vitejs/plugin-react')).default(),
    ],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });
  console.log('✅ Frontend build completed');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Step 2: Build backend
console.log('🔧 Building backend...');
try {
  const { stdout, stderr } = await execAsync(
    'npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist'
  );
  if (stderr) console.warn('Build warnings:', stderr);
  console.log('✅ Backend build completed');
} catch (error) {
  console.error('❌ Backend build failed:', error.message);
  process.exit(1);
}

console.log('🎉 Production build completed successfully!');