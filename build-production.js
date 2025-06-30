#!/usr/bin/env node

/**
 * Production build script for Render deployment
 * Uses shell commands to avoid module import issues
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

console.log('🚀 Starting production build...');

// Create a minimal vite config for production
const minimalViteConfig = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: path.resolve(process.cwd(), "client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist/public"),
    emptyOutDir: true,
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
`;

try {
  // Step 1: Create temporary minimal vite config
  console.log('📝 Creating minimal vite config...');
  fs.writeFileSync('vite.config.production.js', minimalViteConfig);
  
  // Step 2: Build frontend with minimal config
  console.log('📦 Building frontend...');
  const { stdout: viteOutput, stderr: viteError } = await execAsync(
    'npx vite build --config vite.config.production.js'
  );
  if (viteError && !viteError.includes('warning')) {
    throw new Error(viteError);
  }
  console.log('✅ Frontend build completed');
  
  // Step 3: Build backend
  console.log('🔧 Building backend...');
  const { stdout: esbuildOutput, stderr: esbuildError } = await execAsync(
    'npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist'
  );
  if (esbuildError && !esbuildError.includes('warning')) {
    console.warn('Build warnings:', esbuildError);
  }
  console.log('✅ Backend build completed');
  
  // Step 4: Cleanup
  console.log('🧹 Cleaning up...');
  fs.unlinkSync('vite.config.production.js');
  
  console.log('🎉 Production build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Cleanup on error
  try {
    fs.unlinkSync('vite.config.production.js');
  } catch (cleanupError) {
    // Ignore cleanup errors
  }
  
  process.exit(1);
}