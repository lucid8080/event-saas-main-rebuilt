#!/usr/bin/env tsx

import { prisma } from '../lib/db';
import { uploadImageToR2, generateSignedUrl, generateEnhancedImageKey, getFileExtension } from '../lib/r2';
import { auth } from '../auth';

async function debugR2Upload() {
  console.log('🔍 Debugging R2 Upload Process\n');

  try {
    // Get the most recent image without R2 key
    const recentImageWithoutR2 = await prisma.generatedImage.findFirst({
      where: {
        r2Key: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!recentImageWithoutR2) {
      console.log('❌ No images found without R2 keys');
      return;
    }

    console.log('📊 Testing with recent image:');
    console.log(`   ID: ${recentImageWithoutR2.id}`);
    console.log(`   URL: ${recentImageWithoutR2.url}`);
    console.log(`   Event Type: ${recentImageWithoutR2.eventType}`);
    console.log(`   Created: ${recentImageWithoutR2.createdAt}`);

    // Test 1: Try to download the image
    console.log('\n🔍 Test 1: Downloading image from URL...');
    try {
      const imageResponse = await fetch(recentImageWithoutR2.url);
      console.log(`   Response status: ${imageResponse.status}`);
      console.log(`   Content-Type: ${imageResponse.headers.get('content-type')}`);
      
      if (!imageResponse.ok) {
        throw new Error(`HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
      }

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      console.log(`   Image size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);
      console.log('   ✅ Image download successful');
    } catch (downloadError) {
      console.log(`   ❌ Image download failed: ${downloadError}`);
      return;
    }

    // Test 2: Try to upload to R2
    console.log('\n🔍 Test 2: Uploading to R2...');
    try {
      const imageResponse = await fetch(recentImageWithoutR2.url);
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const contentType = imageResponse.headers.get('content-type') || 'image/png';
      
      // Generate R2 key
      const extension = getFileExtension(contentType);
      const imageMetadata = {
        userId: recentImageWithoutR2.userId,
        eventType: recentImageWithoutR2.eventType,
        aspectRatio: '1:1', // Default
        watermarkEnabled: false,
        promptHash: 'test-hash',
        generationModel: 'ideogram-v3',
        customTags: undefined
      };
      
      const enhancedKey = generateEnhancedImageKey(imageMetadata, extension);
      const key = enhancedKey.key;
      
      console.log(`   Generated key: ${key}`);
      
      // Upload to R2
      const r2Key = await uploadImageToR2(key, imageBuffer, contentType);
      console.log(`   ✅ Upload successful: ${r2Key}`);
      
      // Test 3: Generate signed URL
      console.log('\n🔍 Test 3: Generating signed URL...');
      const signedUrl = await generateSignedUrl(r2Key, 3600);
      console.log(`   ✅ Signed URL generated: ${signedUrl.substring(0, 50)}...`);
      
      // Test 4: Update database record
      console.log('\n🔍 Test 4: Updating database record...');
      await prisma.generatedImage.update({
        where: {
          id: recentImageWithoutR2.id
        },
        data: {
          r2Key: r2Key,
          url: signedUrl
        }
      });
      console.log('   ✅ Database record updated');
      
      console.log('\n🎉 All tests passed! R2 upload process is working.');
      
    } catch (uploadError) {
      console.log(`   ❌ R2 upload failed: ${uploadError}`);
      
      // Check if it's a specific error
      if (uploadError instanceof Error) {
        console.log(`   Error message: ${uploadError.message}`);
        console.log(`   Error stack: ${uploadError.stack}`);
      }
    }

  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugR2Upload().catch(console.error); 