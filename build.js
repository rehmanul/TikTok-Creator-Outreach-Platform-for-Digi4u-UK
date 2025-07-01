#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function build() {
  try {
    console.log('🚀 Starting production build...');
    console.log('📍 Current directory:', process.cwd());
    
    console.log('📦 Building frontend with Vite...');
    const { stdout, stderr } = await execAsync('NODE_ENV=production npx vite build', {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        REPL_ID: undefined // Disable Replit plugins
      }
    });
    
    if (stderr && !stderr.includes('warning')) {
      console.warn('Build warnings:', stderr);
    }
    console.log('✅ Frontend build completed');
    
    console.log('🔧 Building backend with esbuild...');
    await execAsync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    console.log('✅ Backend build completed');
    
    console.log('🎉 Production build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

build();