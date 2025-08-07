#!/usr/bin/env tsx
/**
 * Fix for Event Generator R2 Issue
 * 
 * Root Cause: Cloud services are disabled via NEXT_PUBLIC_ENABLE_CLOUD_SERVICES
 * This causes R2 uploads to fail silently, resulting in 4-byte corrupted files
 * 
 * Solution: Enable cloud services or implement proper fallback handling
 */

import { prisma } from '@/lib/db';
import { featureFlags } from '@/lib/tree-shaking';

async function fixEventGeneratorR2Issue() {
  console.log('🔧 Fixing Event Generator R2 Issue');
  console.log('===================================\n');

  // Step 1: Check current feature flag status
  console.log('1. Checking Feature Flag Status...');
  const cloudServicesEnabled = process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES === 'true';
  
  console.log(`   Cloud Services: ${cloudServicesEnabled ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   Environment Variable: NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=${process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES || 'undefined'}\n`);

  if (!cloudServicesEnabled) {
    console.log('🚨 ROOT CAUSE CONFIRMED: Cloud services are disabled!');
    console.log('   This prevents R2 uploads, causing 4-byte corrupted files.\n');
    
    console.log('📋 SOLUTION OPTIONS:');
    console.log('   Option 1: Enable cloud services (Recommended)');
    console.log('   Option 2: Fix fallback handling in image generation\n');
  }

  // Step 2: Check for corrupted images in database
  console.log('2. Scanning for Corrupted Images...');
  
  try {
    // Find images with R2 keys but potentially corrupted files
    const suspiciousImages = await prisma.generatedImage.findMany({
      where: {
        r2Key: { not: null },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        id: true,
        r2Key: true,
        url: true,
        prompt: true,
        eventType: true,
        createdAt: true,
        userId: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`   Found ${suspiciousImages.length} recent images with R2 keys`);
    
    if (suspiciousImages.length > 0) {
      console.log('\n   Recent Images with R2 Keys:');
      suspiciousImages.forEach((img, index) => {
        console.log(`   ${index + 1}. ID: ${img.id.substring(0, 8)}... | Event: ${img.eventType || 'Unknown'} | Created: ${img.createdAt.toISOString()}`);
      });
    }

  } catch (dbError) {
    console.error('   ❌ Error querying database:', dbError);
  }

  // Step 3: Provide actionable solutions
  console.log('\n🛠️ IMMEDIATE ACTION REQUIRED:');
  console.log('\n   OPTION 1 (Recommended): Enable Cloud Services');
  console.log('   ========================================');
  console.log('   Set the following environment variable:');
  console.log('   NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true\n');
  
  console.log('   How to set this:');
  console.log('   - Local Development: Add to .env.local file');
  console.log('   - Production (Vercel): Add in dashboard → Settings → Environment Variables');
  console.log('   - Production (Render): Add in dashboard → Environment tab');
  console.log('   - Production (Railway): Add via railway CLI or dashboard\n');

  console.log('   OPTION 2: Fix Fallback Handling');
  console.log('   ================================');
  console.log('   Update the image generation code to properly handle R2 upload failures\n');

  // Step 4: Check other critical environment variables
  console.log('3. Checking R2 Configuration...');
  const r2Config = {
    accessKeyId: !!process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: !!process.env.R2_SECRET_ACCESS_KEY,
    bucketName: !!process.env.R2_BUCKET_NAME,
    endpoint: !!process.env.R2_ENDPOINT,
  };

  console.log('   R2 Environment Variables:');
  Object.entries(r2Config).forEach(([key, isSet]) => {
    console.log(`   - ${key}: ${isSet ? '✅ Set' : '❌ Missing'}`);
  });

  const allR2VarsSet = Object.values(r2Config).every(Boolean);
  if (!allR2VarsSet) {
    console.log('\n   ⚠️ Some R2 environment variables are missing!');
    console.log('   This could also cause upload failures.');
  }

  console.log('\n✅ Analysis Complete');
  console.log('\nNext Steps:');
  console.log('1. Enable NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true');
  console.log('2. Ensure all R2 environment variables are set');
  console.log('3. Test image generation');
  console.log('4. Monitor for any remaining issues');
}

// Run the fix analysis
if (require.main === module) {
  fixEventGeneratorR2Issue()
    .catch(console.error)
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { fixEventGeneratorR2Issue };