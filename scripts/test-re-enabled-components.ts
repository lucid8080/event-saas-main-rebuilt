#!/usr/bin/env tsx

import { testR2Connection } from '@/lib/r2';
import { testWebPConversion } from '@/lib/webp-converter';
import { getWebPStorageStats } from '@/lib/webp-storage';
import { featureFlags } from '@/lib/tree-shaking';

async function testReEnabledComponents() {
  console.log('🧪 Testing Re-Enabled Components');
  console.log('================================\n');

  try {
    // Step 1: Test R2 Connection
    console.log('1. Testing R2 Connection...');
    const r2Connection = await testR2Connection();
    console.log(`   R2 Connection: ${r2Connection ? '✅ Working' : '❌ Failed'}`);
    console.log('');

    // Step 2: Test WebP Conversion
    console.log('2. Testing WebP Conversion...');
    const webpTest = await testWebPConversion();
    if (webpTest.success) {
      console.log(`   WebP Conversion: ✅ Working (${webpTest.compressionRatio?.toFixed(1)}% compression)`);
    } else {
      console.log(`   WebP Conversion: ❌ Failed - ${webpTest.error}`);
    }
    console.log('');

    // Step 3: Test WebP Storage
    console.log('3. Testing WebP Storage...');
    const webpStats = await getWebPStorageStats();
    if (webpStats.success) {
      console.log(`   WebP Storage: ✅ Working`);
      console.log(`   - Total WebP files: ${webpStats.stats?.totalWebPFiles}`);
      console.log(`   - Total WebP size: ${(webpStats.stats?.totalWebPSize || 0) / 1024} KB`);
    } else {
      console.log(`   WebP Storage: ❌ Failed - ${webpStats.error}`);
    }
    console.log('');

    // Step 4: Check Feature Flags
    console.log('4. Checking Feature Flags...');
    console.log(`   Charts: ${featureFlags.charts ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Animations: ${featureFlags.animations ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Cloud Services: ${featureFlags.cloudServices ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`   Image Processing: ${featureFlags.imageProcessing ? '✅ Enabled' : '❌ Disabled'}`);
    console.log('');

    // Step 5: Test Environment Variables
    console.log('5. Checking Environment Variables...');
    const requiredEnvVars = [
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
      'R2_ENDPOINT',
      'NEXT_PUBLIC_ENABLE_CHARTS',
      'NEXT_PUBLIC_ENABLE_ANIMATIONS',
      'NEXT_PUBLIC_ENABLE_CLOUD_SERVICES',
      'NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING',
    ];

    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`   ${envVar}: ✅ Set`);
      } else {
        console.log(`   ${envVar}: ❌ Not set`);
      }
    });
    console.log('');

    // Step 6: Summary
    console.log('📊 Test Summary');
    console.log('===============');
    console.log(`✅ R2 Connection: ${r2Connection ? 'Working' : 'Failed'}`);
    console.log(`✅ WebP Conversion: ${webpTest.success ? 'Working' : 'Failed'}`);
    console.log(`✅ WebP Storage: ${webpStats.success ? 'Working' : 'Failed'}`);
    console.log(`✅ Feature Flags: ${Object.values(featureFlags).some(f => f) ? 'Some Enabled' : 'All Disabled'}`);
    
    const allWorking = r2Connection && webpTest.success && webpStats.success;
    console.log(`\n🎯 Overall Status: ${allWorking ? '✅ All Components Working' : '❌ Some Issues Found'}`);

    if (!allWorking) {
      console.log('\n🔧 Recommendations:');
      if (!r2Connection) {
        console.log('   - Check R2 environment variables and credentials');
      }
      if (!webpTest.success) {
        console.log('   - Check if sharp is properly installed');
      }
      if (!webpStats.success) {
        console.log('   - Check R2 bucket permissions');
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testReEnabledComponents(); 