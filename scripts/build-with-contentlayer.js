const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting build process...');

try {
  // Run contentlayer build
  console.log('Running contentlayer build...');
  execSync('npx contentlayer build', { stdio: 'inherit' });
  console.log('Contentlayer build completed successfully');
} catch (error) {
  // Check if contentlayer generated the documents despite the exit code error
  if (fs.existsSync('.contentlayer')) {
    console.log('Contentlayer documents generated successfully, continuing with Next.js build...');
  } else {
    console.error('Contentlayer failed to generate documents');
    process.exit(1);
  }
}

try {
  // Run Next.js build with minimal environment variables
  console.log('Running Next.js build...');
  
  // Set environment variables to disable all problematic features
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NEXT_TRACE = '0';
  process.env.GENERATE_SOURCEMAP = 'false';
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  process.env.NEXT_DISABLE_TELEMETRY = '1';
  process.env.NEXT_DISABLE_TRACING = '1';
  process.env.NEXT_DISABLE_FS_TRACING = '1';
  
  execSync('next build', { 
    stdio: 'inherit'
  });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Next.js build failed:', error.message);
  process.exit(1);
} 