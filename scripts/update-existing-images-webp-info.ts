#!/usr/bin/env tsx

import { prisma } from '../lib/db';
import { getFileExtension, generateWebPKey, isWebPKey } from '../lib/r2';
import { getImageMetadata } from '../lib/webp-converter';

async function updateExistingImagesWebPInfo() {
  console.log('🔄 Starting WebP information update for existing images...\n');

  try {
    // Get all images that don't have WebP information yet
    const images = await prisma.generatedImage.findMany({
      where: {
        OR: [
          { originalFormat: null },
          { webpKey: null },
          { compressionRatio: null },
        ],
      },
      select: {
        id: true,
        r2Key: true,
        url: true,
        createdAt: true,
      },
    });

    console.log(`📊 Found ${images.length} images to update with WebP information`);

    if (images.length === 0) {
      console.log('✅ No images need WebP information updates');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const image of images) {
      try {
        const updateData: any = {};

        // Determine original format from URL or R2 key
        let originalFormat = 'unknown';
        
        if (image.r2Key) {
          // Extract format from R2 key
          const keyParts = image.r2Key.split('.');
          if (keyParts.length > 1) {
            originalFormat = keyParts[keyParts.length - 1].toLowerCase();
          }
        } else if (image.url) {
          // Extract format from URL
          const urlParts = image.url.split('.');
          if (urlParts.length > 1) {
            originalFormat = urlParts[urlParts.length - 1].toLowerCase();
          }
        }

        // Normalize format
        if (originalFormat === 'jpeg') originalFormat = 'jpg';
        if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(originalFormat)) {
          updateData.originalFormat = originalFormat;
        } else {
          updateData.originalFormat = 'png'; // Default assumption
        }

        // Generate WebP key if we have an R2 key
        if (image.r2Key && !isWebPKey(image.r2Key)) {
          updateData.webpKey = generateWebPKey(image.r2Key);
        }

        // Set default compression ratio (will be updated after actual conversion)
        updateData.compressionRatio = null;

        // Enable WebP conversion by default
        updateData.webpEnabled = true;

        // Update the image record
        await prisma.generatedImage.update({
          where: { id: image.id },
          data: updateData,
        });

        updatedCount++;
        
        if (updatedCount % 10 === 0) {
          console.log(`✅ Updated ${updatedCount}/${images.length} images`);
        }

      } catch (error) {
        console.error(`❌ Error updating image ${image.id}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 WebP information update completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} images`);
    console.log(`❌ Errors: ${errorCount} images`);
    console.log(`📊 Total processed: ${images.length} images`);

    // Show summary of formats found
    const formatSummary = await prisma.generatedImage.groupBy({
      by: ['originalFormat'],
      _count: {
        originalFormat: true,
      },
      where: {
        originalFormat: { not: null },
      },
    });

    console.log('\n📋 Format Distribution:');
    formatSummary.forEach(({ originalFormat, _count }) => {
      console.log(`   ${originalFormat || 'unknown'}: ${_count} images`);
    });

    // Show WebP conversion readiness
    const webpReadyCount = await prisma.generatedImage.count({
      where: {
        webpEnabled: true,
        originalFormat: { in: ['png', 'jpg', 'jpeg'] },
      },
    });

    const webpKeyCount = await prisma.generatedImage.count({
      where: {
        webpKey: { not: null },
      },
    });

    console.log('\n🔧 WebP Conversion Status:');
    console.log(`   Ready for conversion: ${webpReadyCount} images`);
    console.log(`   Already have WebP keys: ${webpKeyCount} images`);
    console.log(`   Total images in database: ${await prisma.generatedImage.count()} images`);

  } catch (error) {
    console.error('💥 Fatal error during WebP information update:', error);
    process.exit(1);
  }
}

// Run the script if executed directly
if (require.main === module) {
  updateExistingImagesWebPInfo()
    .then(() => {
      console.log('\n✨ WebP information update completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 WebP information update failed:', error);
      process.exit(1);
    });
}

export { updateExistingImagesWebPInfo }; 