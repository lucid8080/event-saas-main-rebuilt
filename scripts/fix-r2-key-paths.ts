#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔧 Fixing R2 Key Paths...\n');

async function fixR2KeyPaths() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    const oldUserId = 'cmdtnz0g70000oosf1uxkcpgc';
    const newUserId = 'cmdvsi8gw0000jy2oig4ahn5x';
    
    // Find images with old user ID in R2 key
    const imagesWithOldPath = await prisma.generatedImage.findMany({
      where: {
        r2Key: {
          contains: oldUserId
        }
      }
    });

    console.log(`Found ${imagesWithOldPath.length} images with old user ID in R2 key`);

    if (imagesWithOldPath.length === 0) {
      console.log('✅ No images need R2 key path updates');
      return;
    }

    let updatedCount = 0;
    let errorCount = 0;

    for (const image of imagesWithOldPath) {
      try {
        // Replace old user ID with new user ID in R2 key
        const newR2Key = image.r2Key!.replace(oldUserId, newUserId);
        
        await prisma.generatedImage.update({
          where: { id: image.id },
          data: { r2Key: newR2Key }
        });

        console.log(`✅ Updated: ${image.r2Key} → ${newR2Key}`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ Failed to update ${image.r2Key}:`, error);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Updated: ${updatedCount} R2 keys`);
    console.log(`  Errors: ${errorCount} keys`);
    console.log(`  Total processed: ${imagesWithOldPath.length}`);

    if (updatedCount > 0) {
      console.log('\n🎉 Successfully fixed R2 key paths!');
      console.log('💡 Your images should now be accessible in the gallery and admin panel.');
    }

  } catch (error) {
    console.error('❌ Error fixing R2 key paths:', error);
  }
}

fixR2KeyPaths()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ R2 key path fix complete');
    process.exit(0);
  }); 