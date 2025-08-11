#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function debugImageOwnership() {
  console.log('🔍 Image Ownership Debug');
  console.log('========================\n');

  try {
    // Step 1: Check the user
    console.log('1. Checking user dre380@gmail.com...');
    const user = await prisma.user.findUnique({
      where: { email: 'dre380@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Credits: ${user.credits}`);

    // Step 2: Check the specific image from the logs
    const imageId = 'cme1l8ku20005o7835p54bbkx'; // From the terminal logs
    console.log(`\n2. Checking image ${imageId}...`);
    
    const image = await prisma.generatedImage.findUnique({
      where: { id: imageId },
      select: {
        id: true,
        userId: true,
        eventType: true,
        isUpscaled: true,
        originalImageId: true,
        upscaledImageId: true,
        createdAt: true
      }
    });

    if (!image) {
      console.log('❌ Image not found');
      return;
    }

    console.log('✅ Image found:');
    console.log(`   ID: ${image.id}`);
    console.log(`   User ID: ${image.userId}`);
    console.log(`   Event Type: ${image.eventType}`);
    console.log(`   Is Upscaled: ${image.isUpscaled}`);
    console.log(`   Original Image ID: ${image.originalImageId}`);
    console.log(`   Upscaled Image ID: ${image.upscaledImageId}`);
    console.log(`   Created: ${image.createdAt}`);

    // Step 3: Check ownership
    console.log('\n3. Ownership Check:');
    console.log(`   Image User ID: ${image.userId}`);
    console.log(`   Current User ID: ${user.id}`);
    console.log(`   Match: ${image.userId === user.id ? '✅' : '❌'}`);

    if (image.userId !== user.id) {
      console.log('\n❌ OWNERSHIP MISMATCH DETECTED');
      console.log('   The image belongs to a different user');
      console.log('   This explains the 403 Forbidden error');
      
      // Check who owns this image
      const imageOwner = await prisma.user.findUnique({
        where: { id: image.userId },
        select: { email: true, name: true }
      });
      
      if (imageOwner) {
        console.log(`   Image owner: ${imageOwner.email} (${imageOwner.name})`);
      }
      
      return;
    }

    // Step 4: Check if image can be upscaled
    console.log('\n4. Upscaling Eligibility:');
    
    if (image.isUpscaled) {
      console.log('❌ Image is already upscaled');
      console.log('   Cannot upscale an already upscaled image');
      return;
    }

    if (image.upscaledImageId) {
      console.log('❌ Image already has an upscaled version');
      console.log(`   Upscaled version ID: ${image.upscaledImageId}`);
      return;
    }

    console.log('✅ Image can be upscaled');

    // Step 5: Check user's other images
    console.log('\n5. Checking user\'s other images...');
    const userImages = await prisma.generatedImage.findMany({
      where: { 
        userId: user.id,
        isUpscaled: false,
        upscaledImageId: null
      },
      select: {
        id: true,
        eventType: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`📸 Found ${userImages.length} images that can be upscaled:`);
    userImages.forEach((img, index) => {
      console.log(`   ${index + 1}. ${img.eventType || 'Unknown'} (ID: ${img.id})`);
    });

    // Step 6: Recommendations
    console.log('\n6. Recommendations:');
    
    if (image.userId !== user.id) {
      console.log('🔧 Fix 1: Use a different image');
      if (userImages.length > 0) {
        console.log(`   Try upscaling image ID: ${userImages[0].id}`);
      }
    }

    if (image.isUpscaled || image.upscaledImageId) {
      console.log('🔧 Fix 2: Image already has upscaled version');
      console.log('   Check the gallery for the upscaled version');
    }

    console.log('\n🔧 Fix 3: Check gallery display');
    console.log('   The gallery might be showing images from other users');
    console.log('   Make sure you\'re only seeing your own images');

  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugImageOwnership()
  .then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
