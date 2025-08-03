#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';
import { generateSignedUrl } from '../lib/r2';

console.log('🔗 Updating R2 Image URLs...\n');

async function updateR2ImageUrls() {
  try {
    // Find all R2 images with empty URLs
    const r2Images = await prisma.generatedImage.findMany({
      where: {
        r2Key: { not: null },
        url: ''
      },
      select: {
        id: true,
        r2Key: true,
        url: true
      }
    });

    console.log(`Found ${r2Images.length} R2 images with empty URLs`);

    if (r2Images.length === 0) {
      console.log('No R2 images found with empty URLs');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const image of r2Images) {
      try {
        // Generate signed URL for the R2 image
        const signedUrl = await generateSignedUrl(image.r2Key!, 3600); // 1 hour expiry
        
        // Update the database with the signed URL
        await prisma.generatedImage.update({
          where: { id: image.id },
          data: { url: signedUrl }
        });

        console.log(`✅ Updated URL for ${image.r2Key}`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ Failed to update ${image.r2Key}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Updated: ${updatedCount} images`);
    console.log(`  Errors: ${errorCount} images`);
    console.log(`  Total processed: ${r2Images.length}`);

    if (updatedCount > 0) {
      console.log('\n🎉 Successfully updated R2 image URLs!');
      console.log('These images should now be visible in the gallery.');
    }

  } catch (error) {
    console.error('❌ Error updating R2 image URLs:', error);
  }
}

updateR2ImageUrls()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ R2 image URL update complete');
    process.exit(0);
  }); 