#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function testUpscaleAPI() {
  console.log('🔍 Upscale API Authentication Test');
  console.log('===================================\n');

  try {
    // Step 1: Check if user dre380@gmail.com exists
    console.log('1. Checking user account...');
    const user = await prisma.user.findUnique({
      where: { email: 'dre380@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        credits: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User dre380@gmail.com not found in database');
      console.log('\n💡 Solutions:');
      console.log('1. User needs to create an account first');
      console.log('2. User may be using a different email address');
      console.log('3. Check if user signed up with Google OAuth');
      return;
    }

    console.log('✅ User found:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name || 'Not set'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
    console.log(`   Credits: ${user.credits}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   OAuth Accounts: ${user.accounts.length}`);

    if (user.accounts.length > 0) {
      user.accounts.forEach(account => {
        console.log(`     - ${account.provider} (${account.providerAccountId})`);
      });
    }

    // Step 2: Check user's images
    console.log('\n2. Checking user images...');
    const userImages = await prisma.generatedImage.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        url: true,
        prompt: true,
        eventType: true,
        isUpscaled: true,
        originalImageId: true,
        upscaledImageId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`📸 Found ${userImages.length} recent images:`);
    userImages.forEach((image, index) => {
      console.log(`   ${index + 1}. ${image.eventType || 'Unknown'} (${image.isUpscaled ? 'Upscaled' : 'Original'})`);
      console.log(`      ID: ${image.id}`);
      console.log(`      Created: ${image.createdAt}`);
      if (image.isUpscaled && image.originalImageId) {
        console.log(`      Original: ${image.originalImageId}`);
      }
      if (!image.isUpscaled && image.upscaledImageId) {
        console.log(`      Upscaled: ${image.upscaledImageId}`);
      }
    });

    // Step 3: Check authentication issues
    console.log('\n3. Authentication Analysis...');
    
    if (!user.emailVerified) {
      console.log('❌ Email not verified - this could cause authentication issues');
      console.log('💡 Solution: User needs to verify their email address');
    }

    if (user.role === 'USER' && user.credits <= 0) {
      console.log('❌ User has no credits - upscaling requires credits');
      console.log('💡 Solution: User needs credits to upscale images');
    }

    if (user.accounts.length === 0) {
      console.log('⚠️  No OAuth accounts - user may be using email/password');
      console.log('💡 Check if user is properly signed in');
    }

    // Step 4: Check for any upscaled images
    console.log('\n4. Checking upscaled images...');
    const upscaledImages = await prisma.generatedImage.findMany({
      where: { 
        userId: user.id,
        isUpscaled: true 
      },
      select: {
        id: true,
        originalImageId: true,
        createdAt: true
      }
    });

    console.log(`🔍 Found ${upscaledImages.length} upscaled images`);
    if (upscaledImages.length > 0) {
      console.log('✅ User has successfully upscaled images before');
    } else {
      console.log('❌ User has never upscaled an image');
    }

    // Step 5: Check original images that can be upscaled
    console.log('\n5. Checking images available for upscaling...');
    const originalImages = await prisma.generatedImage.findMany({
      where: { 
        userId: user.id,
        isUpscaled: false,
        upscaledImageId: null // No upscaled version exists
      },
      select: {
        id: true,
        eventType: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    console.log(`📸 Found ${originalImages.length} images that can be upscaled:`);
    originalImages.forEach((image, index) => {
      console.log(`   ${index + 1}. ${image.eventType || 'Unknown'} (ID: ${image.id})`);
    });

    // Step 6: Recommendations
    console.log('\n6. Recommendations...');
    
    if (!user.emailVerified) {
      console.log('🔧 Fix 1: Verify email address');
      console.log('   - User should check their email for verification link');
      console.log('   - Or use Google OAuth sign-in instead');
    }

    if (user.credits <= 0) {
      console.log('🔧 Fix 2: Add credits to user account');
      console.log('   - Admin can add credits via admin panel');
      console.log('   - Or user needs to upgrade their plan');
    }

    if (user.accounts.length === 0) {
      console.log('🔧 Fix 3: Check authentication method');
      console.log('   - User should try signing out and back in');
      console.log('   - Or use Google OAuth for more reliable authentication');
    }

    console.log('\n🔧 Fix 4: Test with a different image');
    if (originalImages.length > 0) {
      console.log(`   - Try upscaling image ID: ${originalImages[0].id}`);
    }

    console.log('\n🔧 Fix 5: Check browser session');
    console.log('   - Clear browser cookies and cache');
    console.log('   - Try in incognito/private mode');
    console.log('   - Check if session token is valid');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

testUpscaleAPI()
  .then(() => {
    console.log('\n✅ Diagnosis complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Diagnosis failed:', error);
    process.exit(1);
  });
