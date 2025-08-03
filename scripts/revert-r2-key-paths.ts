#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔄 Reverting R2 Key Paths to Original User ID...\n');

async function revertR2KeyPaths() {
  try {
    const newUserId = 'cmdvsi8gw0000jy2oig4ahn5x';
    const oldUserId = 'cmdtnz0g70000oosf1uxkcpgc';
    
    // Find images with new user ID in R2 key
    const imagesWithNewPath = await prisma.generatedImage.findMany({
      where: {
        r2Key: {
          contains: newUserId
        }
      }
    });

    console.log(`Found ${imagesWithNewPath.length} images with new user ID in R2 key`);

    if (imagesWithNewPath.length === 0) {
      console.log('✅ No images need R2 key path reversion');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const image of imagesWithNewPath) {
      try {
        // Replace new user ID with old user ID in R2 key
        const oldR2Key = image.r2Key!.replace(newUserId, oldUserId);
        
        await prisma.generatedImage.update({
          where: { id: image.id },
          data: { r2Key: oldR2Key }
        });

        console.log(`✅ Reverted: ${image.r2Key} → ${oldR2Key}`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ Failed to revert ${image.r2Key}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Reverted: ${updatedCount} R2 keys`);
    console.log(`  Errors: ${errorCount} keys`);
    console.log(`  Total processed: ${imagesWithNewPath.length}`);

    if (updatedCount > 0) {
      console.log('\n🎉 Successfully reverted R2 key paths!');
      console.log('💡 Your images should now be accessible in the gallery.');
    }

  } catch (error) {
    console.error('❌ Error reverting R2 key paths:', error);
  }
}

revertR2KeyPaths()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ R2 key path reversion complete');
    process.exit(0);
  }); 