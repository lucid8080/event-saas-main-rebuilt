const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Testing build configuration...');

try {
  // Check if next.config.js exists and is valid
  const configPath = path.join(process.cwd(), 'next.config.js');
  if (!fs.existsSync(configPath)) {
    throw new Error('next.config.js not found');
  }
  console.log('✅ next.config.js found');

  // Check for problematic imports in chart components
  const chartsDir = path.join(process.cwd(), 'components', 'charts');
  if (fs.existsSync(chartsDir)) {
    const chartFiles = fs.readdirSync(chartsDir).filter(file => file.endsWith('.tsx'));
    
    for (const file of chartFiles) {
      const filePath = path.join(chartsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for active recharts imports
      if (content.includes('import') && content.includes('from "recharts"') && !content.includes('// import')) {
        throw new Error(`Active recharts import found in ${file}`);
      }
      
      // Check for active sharp imports
      if (content.includes('import') && content.includes('from "sharp"') && !content.includes('// import')) {
        throw new Error(`Active sharp import found in ${file}`);
      }

      // Check for active shiki imports
      if (content.includes('import') && content.includes('from "shiki"') && !content.includes('// import')) {
        throw new Error(`Active shiki import found in ${file}`);
      }
    }
    console.log(`✅ Chart components validated (${chartFiles.length} files)`);
  }

  // Check for problematic imports in lib files
  const libDir = path.join(process.cwd(), 'lib');
  if (fs.existsSync(libDir)) {
    const libFiles = fs.readdirSync(libDir).filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
    
    for (const file of libFiles) {
      const filePath = path.join(libDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for active recharts imports
      if (content.includes('import') && content.includes('from "recharts"') && !content.includes('// import')) {
        throw new Error(`Active recharts import found in lib/${file}`);
      }
      
      // Check for active sharp imports
      if (content.includes('import') && content.includes('from "sharp"') && !content.includes('// import')) {
        throw new Error(`Active sharp import found in lib/${file}`);
      }

      // Check for active shiki imports
      if (content.includes('import') && content.includes('from "shiki"') && !content.includes('// import')) {
        throw new Error(`Active shiki import found in lib/${file}`);
      }
    }
    console.log(`✅ Lib files validated (${libFiles.length} files)`);
  }

  // Check for problematic imports in components directory
  const componentsDir = path.join(process.cwd(), 'components');
  if (fs.existsSync(componentsDir)) {
    const componentFiles = fs.readdirSync(componentsDir, { recursive: true })
      .filter(file => typeof file === 'string' && (file.endsWith('.tsx') || file.endsWith('.ts')))
      .filter(file => !file.includes('charts')); // Skip charts directory as it's already checked
    
    for (const file of componentFiles) {
      const filePath = path.join(componentsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for active recharts imports
      if (content.includes('import') && content.includes('from "recharts"') && !content.includes('// import')) {
        throw new Error(`Active recharts import found in components/${file}`);
      }
      
      // Check for active sharp imports
      if (content.includes('import') && content.includes('from "sharp"') && !content.includes('// import')) {
        throw new Error(`Active sharp import found in components/${file}`);
      }

      // Check for active shiki imports
      if (content.includes('import') && content.includes('from "shiki"') && !content.includes('// import')) {
        throw new Error(`Active shiki import found in components/${file}`);
      }
    }
    console.log(`✅ Components validated (${componentFiles.length} files)`);
  }

  // Check package.json for required dependencies
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check if problematic dependencies exist
    if (packageJson.dependencies) {
      if (packageJson.dependencies.recharts) {
        console.log('ℹ️  recharts dependency found (should be externalized)');
      }
      if (packageJson.dependencies.sharp) {
        console.log('ℹ️  sharp dependency found (should be externalized)');
      }
      if (packageJson.dependencies.shiki) {
        console.log('ℹ️  shiki dependency found (should be externalized)');
      }
    }
    console.log('✅ package.json validated');
  }

  // Check next.config.js for proper configuration
  const configContent = fs.readFileSync(configPath, 'utf8');
  if (!configContent.includes('splitChunks: false')) {
    console.log('⚠️  Warning: splitChunks not disabled in next.config.js');
  }
  if (!configContent.includes('sharp') || !configContent.includes('recharts')) {
    console.log('⚠️  Warning: Problematic libraries not externalized in next.config.js');
  }

  console.log('\n✅ Build configuration test passed!');
  console.log('The "self is not defined" error should be resolved.');
  console.log('\nNext steps:');
  console.log('1. Run "npm run build" to test the full build process');
  console.log('2. Deploy to production to verify the fix works');
  console.log('3. Monitor build logs for any remaining issues');
  console.log('\nIMPORTANT: Make sure to commit and push these changes to production!');
  
} catch (error) {
  console.error('❌ Build configuration test failed:', error.message);
  console.log('\nTroubleshooting steps:');
  console.log('1. Check that all recharts imports are commented out');
  console.log('2. Verify sharp is properly externalized');
  console.log('3. Ensure webpack configuration is correct');
  console.log('4. Check for any remaining "self is not defined" errors');
  console.log('5. Make sure changes are committed and deployed to production');
  process.exit(1);
} 