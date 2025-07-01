#!/usr/bin/env node

/**
 * Production deployment build script for Render
 * Ensures all dependencies are available and builds successfully
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { resolve } from 'path';

const execAsync = promisify(exec);

async function build() {
  try {
    console.log('🚀 Starting production deployment build...');
    console.log('📍 Current directory:', process.cwd());
    
    // Check if vite is available
    const vitePath = resolve('./node_modules/.bin/vite');
    console.log('🔍 Checking vite availability...');
    console.log('Vite path:', vitePath);
    console.log('Vite exists:', existsSync(vitePath));
    
    // List node_modules to verify installation
    console.log('📋 Checking installed packages...');
    try {
      const { stdout } = await execAsync('ls -la node_modules/.bin/ | grep vite || echo "Vite not found in .bin"');
      console.log('Vite in .bin:', stdout.trim());
    } catch (e) {
      console.log('Could not check .bin directory');
    }
    
    // Try to install vite explicitly if not found
    if (!existsSync(vitePath)) {
      console.log('⚠️ Vite not found, installing explicitly...');
      await execAsync('npm install vite @vitejs/plugin-react --save-dev');
    }
    
    console.log('📦 Building frontend with Vite...');
    const { stdout: viteOut, stderr: viteErr } = await execAsync('./node_modules/.bin/vite build', {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        REPL_ID: undefined
      }
    });
    
    if (viteErr && !viteErr.includes('warning') && !viteErr.includes('Browserslist')) {
      console.warn('Build warnings:', viteErr);
    }
    if (viteOut) {
      console.log('Vite output:', viteOut);
    }
    console.log('✅ Frontend build completed');
    
    console.log('🔧 Building backend with esbuild...');
    const { stdout: esbuildOut } = await execAsync('./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    if (esbuildOut) {
      console.log('Esbuild output:', esbuildOut);
    }
    console.log('✅ Backend build completed');
    
    console.log('🎉 Production build completed successfully!');
    
    // Verify build outputs
    console.log('🔍 Verifying build outputs...');
    try {
      const { stdout } = await execAsync('ls -la dist/');
      console.log('Build outputs:\n', stdout);
    } catch (e) {
      console.log('Could not verify build outputs');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    console.error('Error details:', error);
    
    // Additional debugging
    console.log('\n🔍 Debug information:');
    try {
      const { stdout } = await execAsync('npm list vite');
      console.log('NPM list vite:', stdout);
    } catch (e) {
      console.log('Could not run npm list vite:', e.message);
    }
    
    try {
      const { stdout } = await execAsync('which node && which npm');
      console.log('Node/NPM paths:', stdout);
    } catch (e) {
      console.log('Could not get node/npm paths');
    }
    
    process.exit(1);
  }
}

build();