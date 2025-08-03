#!/usr/bin/env tsx

import { prisma } from '../lib/db';
import { generateWebPKey } from '../lib/r2';
import { getWebPInfo } from '../lib/webp-storage';

async function fixWebPDatabaseUpdates() {
  console.log('🔧 Fixing WebP database updates...\n');

  try {
    // Find images that have WebP keys but no compression ratio
    const incompleteConversions = await prisma.generatedImage.findMany({
      where: {
        webpKey: { not: null },
        compressionRatio: null,
        r2Key: { not: null },
      },
      select: {
        id: true,
        r2Key: true,
        webpKey: true,
        originalFormat: true,
      },
    });

    console.log(`📊 Found ${incompleteConversions.length} images with incomplete WebP data`);

    if (incompleteConversions.length === 0) {
      console.log('✅ No incomplete conversions found');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const image of incompleteConversions) {
      try {
        // Get WebP file info from R2
        const webpInfo = await getWebPInfo(image.r2Key!);
        
        if (webpInfo.exists && webpInfo.size) {
          // Get original file size (estimate based on format)
          let estimatedOriginalSize = 0;
          
          // Get a sample of similar images to estimate original size
          const similarImages = await prisma.generatedImage.findMany({
            where: {
              originalFormat: image.originalFormat,
              compressionRatio: { not: null },
            },
            select: {
              compressionRatio: true,
            },
            take: 5,
          });

          if (similarImages.length > 0) {
            const avgCompression = similarImages.reduce((sum, img) => sum + (img.compressionRatio || 0), 0) / similarImages.length;
            estimatedOriginalSize = Math.round(webpInfo.size / (1 - avgCompression / 100));
          } else {
            // Default estimation based on format
            estimatedOriginalSize = image.originalFormat === 'png' ? webpInfo.size * 3 : webpInfo.size * 2;
          }

          const compressionRatio = ((estimatedOriginalSize - webpInfo.size) / estimatedOriginalSize) * 100;

          // Update database
          await prisma.generatedImage.update({
            where: { id: image.id },
            data: {
              compressionRatio: Math.round(compressionRatio * 100) / 100, // Round to 2 decimal places
            },
          });

          updatedCount++;
          console.log(`   ✅ Updated ${image.r2Key}: ${compressionRatio.toFixed(1)}% compression`);
        } else {
          console.log(`   ⚠️ WebP file not found for ${image.r2Key}`);
        }

      } catch (error) {
        console.error(`   ❌ Error updating ${image.r2Key}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Database update completed!`);
    console.log(`✅ Successfully updated: ${updatedCount} images`);
    console.log(`❌ Errors: ${errorCount} images`);

    // Show updated statistics
    const stats = await prisma.generatedImage.aggregate({
      where: {
        compressionRatio: { not: null },
      },
      _avg: { compressionRatio: true },
      _count: { compressionRatio: true },
    });

    if (stats._count.compressionRatio > 0) {
      console.log(`📊 Updated statistics:`);
      console.log(`   Total converted images: ${stats._count.compressionRatio}`);
      console.log(`   Average compression ratio: ${stats._avg.compressionRatio?.toFixed(2)}%`);
    }

  } catch (error) {
    console.error('💥 Fatal error during database update:', error);
    process.exit(1);
  }
}

// Run the script if executed directly
if (require.main === module) {
  fixWebPDatabaseUpdates()
    .then(() => {
      console.log('\n✨ Database update completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Database update failed:', error);
      process.exit(1);
    });
}

export { fixWebPDatabaseUpdates }; 