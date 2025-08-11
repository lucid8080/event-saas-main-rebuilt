#!/usr/bin/env tsx
/**
 * Diagnose Gallery Issue - Generated Events Not Showing
 * 
 * This script helps identify why generated events are not showing up in the gallery
 * on the production server. It checks environment variables, database state,
 * and API functionality.
 */

import { prisma } from '@/lib/db';
import { auth } from '@/auth';

async function diagnoseGalleryIssue() {
  console.log('🔍 Diagnosing Gallery Issue - Generated Events Not Showing');
  console.log('==========================================================\n');

  // Step 1: Check environment variables
  console.log('1. Checking Environment Variables...');
  const envVars = {
    cloudServices: process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES,
    charts: process.env.NEXT_PUBLIC_ENABLE_CHARTS,
    imageProcessing: process.env.NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING,
    animations: process.env.NEXT_PUBLIC_ENABLE_ANIMATIONS,
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing',
    authSecret: process.env.AUTH_SECRET ? 'Set' : 'Missing',
    r2AccessKey: process.env.R2_ACCESS_KEY_ID ? 'Set' : 'Missing',
    r2SecretKey: process.env.R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing',
    r2Bucket: process.env.R2_BUCKET_NAME ? 'Set' : 'Missing',
    r2Endpoint: process.env.R2_ENDPOINT ? 'Set' : 'Missing',
  };

  Object.entries(envVars).forEach(([key, value]) => {
    const status = value === 'true' || value === 'Set' ? '✅' : '❌';
    const critical = ['cloudServices', 'databaseUrl', 'authSecret'].includes(key);
    const indicator = critical ? '🚨' : '⚠️';
    console.log(`   ${indicator} ${key}: ${status} ${value || 'undefined'}`);
  });
  console.log('');

  // Step 2: Check database connection
  console.log('2. Testing Database Connection...');
  try {
    await prisma.$connect();
    console.log('   ✅ Database connection successful');
    
    // Check if we can query the database
    const userCount = await prisma.user.count();
    console.log(`   ✅ Database accessible - ${userCount} users found`);
  } catch (error) {
    console.log('   ❌ Database connection failed:', error);
    return;
  }
  console.log('');

  // Step 3: Check authentication
  console.log('3. Testing Authentication...');
  try {
    const session = await auth();
    if (session?.user?.id) {
      console.log('   ✅ Authentication working');
      console.log(`   ✅ User ID: ${session.user.id}`);
      console.log(`   ✅ User Email: ${session.user.email}`);
    } else {
      console.log('   ❌ No active session found');
    }
  } catch (error) {
    console.log('   ❌ Authentication failed:', error);
  }
  console.log('');

  // Step 4: Check for generated images in database
  console.log('4. Checking Generated Images in Database...');
  try {
    const totalImages = await prisma.generatedImage.count();
    console.log(`   📊 Total images in database: ${totalImages}`);

    if (totalImages > 0) {
      const recentImages = await prisma.generatedImage.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          url: true,
          r2Key: true,
          eventType: true,
          createdAt: true,
          isUpscaled: true,
        }
      });

      console.log('   📸 Recent images:');
      recentImages.forEach((image, index) => {
        console.log(`      ${index + 1}. ID: ${image.id}`);
        console.log(`         User: ${image.userId}`);
        console.log(`         Event: ${image.eventType || 'N/A'}`);
        console.log(`         R2 Key: ${image.r2Key ? '✅ Set' : '❌ Missing'}`);
        console.log(`         URL: ${image.url.substring(0, 50)}...`);
        console.log(`         Created: ${image.createdAt.toISOString()}`);
        console.log(`         Upscaled: ${image.isUpscaled ? 'Yes' : 'No'}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No images found in database');
    }
  } catch (error) {
    console.log('   ❌ Error querying images:', error);
  }
  console.log('');

  // Step 5: Check user-specific images
  console.log('5. Checking User-Specific Images...');
  try {
    const session = await auth();
    if (session?.user?.id) {
      const userImages = await prisma.generatedImage.findMany({
        where: { userId: session.user.id },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          eventType: true,
          url: true,
          r2Key: true,
          createdAt: true,
        }
      });

      console.log(`   👤 Images for user ${session.user.id}: ${userImages.length}`);
      
      if (userImages.length > 0) {
        console.log('   📸 User images:');
        userImages.forEach((image, index) => {
          console.log(`      ${index + 1}. ${image.eventType || 'N/A'} - ${image.createdAt.toISOString()}`);
          console.log(`         R2 Key: ${image.r2Key ? '✅ Set' : '❌ Missing'}`);
          console.log(`         URL: ${image.url.substring(0, 50)}...`);
        });
      } else {
        console.log('   ❌ No images found for current user');
      }
    } else {
      console.log('   ⚠️ No authenticated user - cannot check user-specific images');
    }
  } catch (error) {
    console.log('   ❌ Error querying user images:', error);
  }
  console.log('');

  // Step 6: Check R2 configuration
  console.log('6. Checking R2 Configuration...');
  const r2Config = {
    accessKey: process.env.R2_ACCESS_KEY_ID,
    secretKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET_NAME,
    endpoint: process.env.R2_ENDPOINT,
  };

  const r2Configured = Object.values(r2Config).every(value => value);
  console.log(`   R2 Configuration: ${r2Configured ? '✅ Complete' : '❌ Incomplete'}`);
  
  if (!r2Configured) {
    console.log('   Missing R2 configuration:');
    Object.entries(r2Config).forEach(([key, value]) => {
      if (!value) {
        console.log(`      ❌ ${key}: Missing`);
      }
    });
  }
  console.log('');

  // Step 7: Check feature flags impact
  console.log('7. Analyzing Feature Flags Impact...');
  const cloudServicesEnabled = process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES === 'true';
  
  if (!cloudServicesEnabled) {
    console.log('   🚨 CRITICAL ISSUE: Cloud services are disabled!');
    console.log('   This will cause:');
    console.log('      - R2 uploads to fail');
    console.log('      - Images to not be stored properly');
    console.log('      - Gallery to not display images correctly');
    console.log('      - 4-byte corrupted files in R2');
    console.log('');
    console.log('   🔧 SOLUTION: Set NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true');
  } else {
    console.log('   ✅ Cloud services are enabled');
  }
  console.log('');

  // Step 8: Summary and recommendations
  console.log('8. Summary and Recommendations...');
  console.log('==================================');
  
  const issues = [];
  
  if (!cloudServicesEnabled) {
    issues.push('Cloud services disabled');
  }
  
  if (!r2Configured) {
    issues.push('R2 configuration incomplete');
  }
  
  if (issues.length === 0) {
    console.log('   ✅ No obvious configuration issues found');
    console.log('   🔍 Next steps:');
    console.log('      - Check production logs for errors');
    console.log('      - Test image generation in production');
    console.log('      - Verify gallery API responses');
    console.log('      - Check browser console for errors');
  } else {
    console.log('   🚨 Issues identified:');
    issues.forEach(issue => console.log(`      - ${issue}`));
    console.log('');
    console.log('   🔧 Immediate actions required:');
    if (!cloudServicesEnabled) {
      console.log('      1. Set NEXT_PUBLIC_ENABLE_CLOUD_SERVICES=true in production');
    }
    if (!r2Configured) {
      console.log('      2. Configure R2 environment variables in production');
    }
    console.log('      3. Restart the production application');
    console.log('      4. Test image generation and gallery display');
  }

  console.log('');
  console.log('🔍 Diagnosis complete. Check the issues above and take appropriate action.');
}

// Run the diagnosis
diagnoseGalleryIssue()
  .catch(console.error)
  .finally(() => process.exit(0));
