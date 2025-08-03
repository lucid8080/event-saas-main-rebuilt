#!/usr/bin/env tsx

import { prisma } from '../lib/db';
import { uploadImageToR2, generateSignedUrl, generateEnhancedImageKey, getFileExtension } from '../lib/r2';

async function fixMissingR2Images() {
  console.log('🔧 Fixing Missing R2 Images\n');

  try {
    // Get all images without R2 keys
    const imagesWithoutR2 = await prisma.generatedImage.findMany({
      where: {
        r2Key: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${imagesWithoutR2.length} images without R2 keys`);

    if (imagesWithoutR2.length === 0) {
      console.log('✅ All images already have R2 keys!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const image of imagesWithoutR2) {
      console.log(`\n📸 Processing: ${image.id} (${image.eventType || 'Unknown'})`);
      
      try {
        let imageBuffer: Buffer;
        let contentType: string;

        // Handle different URL types
        if (image.url.startsWith('data:')) {
          // Handle data URL (watermarked image)
          console.log('  Processing data URL (watermarked image)');
          const base64Data = image.url.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
          contentType = 'image/png';
        } else {
          // Handle regular URL (download from Ideogram)
          console.log('  Downloading image from URL');
          const imageResponse = await fetch(image.url);
          if (!imageResponse.ok) {
            throw new Error(`Failed to download image: HTTP ${imageResponse.status}`);
          }
          
          imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          contentType = imageResponse.headers.get('content-type') || 'image/png';
        }

        console.log(`  Image size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);

        // Generate R2 key
        const extension = getFileExtension(contentType);
        const imageMetadata = {
          userId: image.userId,
          eventType: image.eventType,
          aspectRatio: '1:1', // Default since we don't have this info
          watermarkEnabled: false, // We'll determine this from the URL
          promptHash: 'legacy-fix',
          generationModel: 'ideogram-v3',
          customTags: undefined
        };
        
        const enhancedKey = generateEnhancedImageKey(imageMetadata, extension);
        const key = enhancedKey.key;
        
        console.log(`  Generated key: ${key}`);

        // Upload to R2
        const r2Key = await uploadImageToR2(key, imageBuffer, contentType);
        console.log(`  ✅ Uploaded to R2: ${r2Key}`);

        // Generate signed URL
        const signedUrl = await generateSignedUrl(r2Key, 3600);
        console.log(`  ✅ Generated signed URL`);

        // Update database record
        await prisma.generatedImage.update({
          where: {
            id: image.id
          },
          data: {
            r2Key: r2Key,
            url: signedUrl
          }
        });

        console.log(`  ✅ Database record updated`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ Failed to process ${image.id}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Successfully processed: ${successCount} images`);
    console.log(`  ❌ Failed to process: ${errorCount} images`);
    console.log(`  📸 Total images processed: ${imagesWithoutR2.length}`);

    if (successCount > 0) {
      console.log(`\n🎉 Successfully uploaded ${successCount} images to R2!`);
      console.log(`   Your R2 Analytics Dashboard should now show the correct count.`);
    }

  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMissingR2Images().catch(console.error); 