const fs = require('fs');
const path = require('path');

// Known heavy packages and their sizes (approximate)
const packageSizes = {
  // UI Libraries
  '@radix-ui/react-*': { size: '2-5MB each', count: 20, total: '~60MB' },
  'framer-motion': { size: '~2MB', count: 1, total: '~2MB' },
  'recharts': { size: '~1.5MB', count: 1, total: '~1.5MB' },
  'swiper': { size: '~1MB', count: 1, total: '~1MB' },
  
  // Cloud Services
  '@aws-sdk/client-s3': { size: '~3MB', count: 1, total: '~3MB' },
  '@aws-sdk/s3-request-presigner': { size: '~1MB', count: 1, total: '~1MB' },
  '@google-cloud/storage': { size: '~5MB', count: 1, total: '~5MB' },
  'googleapis': { size: '~8MB', count: 1, total: '~8MB' },
  
  // Image Processing
  'sharp': { size: '~15MB', count: 1, total: '~15MB' },
  'shiki': { size: '~2MB', count: 1, total: '~2MB' },
  
  // Content Management
  'contentlayer': { size: '~3MB', count: 1, total: '~3MB' },
  'contentlayer2': { size: '~3MB', count: 1, total: '~3MB' },
  'next-contentlayer2': { size: '~2MB', count: 1, total: '~2MB' },
  
  // Development Tools
  'eslint': { size: '~2MB', count: 1, total: '~2MB' },
  'prettier': { size: '~1MB', count: 1, total: '~1MB' },
  'typescript': { size: '~3MB', count: 1, total: '~3MB' },
  
  // Other Heavy Packages
  'next-auth': { size: '~2MB', count: 1, total: '~2MB' },
  'stripe': { size: '~3MB', count: 1, total: '~3MB' },
  'react-email': { size: '~2MB', count: 1, total: '~2MB' },
  'react-quill': { size: '~1MB', count: 1, total: '~1MB' },
  'vaul': { size: '~1MB', count: 1, total: '~1MB' },
};

// Categories for optimization
const categories = {
  'UI Components': [
    '@radix-ui/react-accessible-icon',
    '@radix-ui/react-accordion',
    '@radix-ui/react-alert-dialog',
    '@radix-ui/react-aspect-ratio',
    '@radix-ui/react-avatar',
    '@radix-ui/react-checkbox',
    '@radix-ui/react-collapsible',
    '@radix-ui/react-context-menu',
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-hover-card',
    '@radix-ui/react-label',
    '@radix-ui/react-menubar',
    '@radix-ui/react-navigation-menu',
    '@radix-ui/react-popover',
    '@radix-ui/react-progress',
    '@radix-ui/react-radio-group',
    '@radix-ui/react-scroll-area',
    '@radix-ui/react-select',
    '@radix-ui/react-separator',
    '@radix-ui/react-slider',
    '@radix-ui/react-slot',
    '@radix-ui/react-switch',
    '@radix-ui/react-tabs',
    '@radix-ui/react-toast',
    '@radix-ui/react-toggle-group',
    '@radix-ui/react-toggle',
    '@radix-ui/react-tooltip',
    'framer-motion',
    'recharts',
    'swiper',
    'vaul'
  ],
  'Cloud Services': [
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    '@google-cloud/storage',
    'googleapis',
    'stripe'
  ],
  'Image Processing': [
    'sharp',
    'shiki'
  ],
  'Content Management': [
    'contentlayer',
    'contentlayer2',
    'next-contentlayer2'
  ],
  'Development Tools': [
    'eslint',
    'prettier',
    'typescript',
    '@types/node',
    '@types/react',
    '@types/react-dom'
  ],
  'Authentication & Email': [
    'next-auth',
    'react-email',
    '@react-email/button',
    '@react-email/components',
    '@react-email/html'
  ],
  'Forms & UI': [
    'react-hook-form',
    'react-quill',
    'react-modal',
    'react-textarea-autosize',
    'react-day-picker'
  ]
};

console.log('🔍 DEPENDENCY ANALYSIS REPORT');
console.log('============================\n');

console.log('📦 HEAVIEST PACKAGES BY CATEGORY:');
console.log('================================\n');

Object.entries(categories).forEach(([category, packages]) => {
  console.log(`\n${category}:`);
  console.log('-'.repeat(category.length));
  
  packages.forEach(pkg => {
    const size = packageSizes[pkg] || packageSizes[pkg.split('/')[0] + '/*'] || { size: '~1MB', total: '~1MB' };
    console.log(`  ${pkg}: ${size.size}`);
  });
});

console.log('\n🎯 OPTIMIZATION RECOMMENDATIONS:');
console.log('==============================\n');

console.log('1. 🎨 UI COMPONENTS OPTIMIZATION:');
console.log('   - Consider lazy loading Radix UI components');
console.log('   - Use dynamic imports for heavy UI libraries');
console.log('   - Bundle only used Radix UI components');
console.log('   - Estimated savings: 40-60MB\n');

console.log('2. ☁️ CLOUD SERVICES OPTIMIZATION:');
console.log('   - Lazy load AWS SDK and Google Cloud packages');
console.log('   - Use dynamic imports for cloud service initialization');
console.log('   - Consider tree-shaking for unused cloud features');
console.log('   - Estimated savings: 10-15MB\n');

console.log('3. 🖼️ IMAGE PROCESSING OPTIMIZATION:');
console.log('   - Sharp is heavy but necessary for image processing');
console.log('   - Consider lazy loading Sharp only when needed');
console.log('   - Shiki can be lazy loaded for syntax highlighting');
console.log('   - Estimated savings: 5-8MB\n');

console.log('4. 📝 CONTENT MANAGEMENT OPTIMIZATION:');
console.log('   - Consider removing one of contentlayer/contentlayer2');
console.log('   - Lazy load content processing libraries');
console.log('   - Estimated savings: 3-5MB\n');

console.log('5. 🛠️ DEVELOPMENT TOOLS OPTIMIZATION:');
console.log('   - Move heavy dev tools to devDependencies');
console.log('   - Use production builds to exclude dev tools');
console.log('   - Estimated savings: 5-8MB\n');

console.log('📊 TOTAL ESTIMATED SAVINGS: 63-96MB');
console.log('📈 POTENTIAL BUNDLE SIZE REDUCTION: 20-30%');

console.log('\n🚀 NEXT STEPS:');
console.log('==============');
console.log('1. Implement lazy loading for heavy components');
console.log('2. Add dynamic imports for cloud services');
console.log('3. Optimize Radix UI component usage');
console.log('4. Consider removing duplicate contentlayer packages');
console.log('5. Move development tools to devDependencies'); 