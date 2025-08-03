#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🌐 Making R2 Images Public...\n');

async function makeR2ImagesPublic() {
  try {
    // Find all images with R2 keys
    const r2Images = await prisma.generatedImage.findMany({
      where: {
        r2Key: { not: null }
      },
      select: {
        id: true,
        r2Key: true,
        isPublic: true,
        eventType: true,
        prompt: true
      }
    });

    console.log(`Found ${r2Images.length} images with R2 keys`);

    if (r2Images.length === 0) {
      console.log('No R2 images found to make public');
      return;
    }

    let updatedCount = 0;
    let alreadyPublicCount = 0;

    for (const image of r2Images) {
      if (image.isPublic) {
        console.log(`⏭️  Skipping ${image.r2Key} (already public)`);
        alreadyPublicCount++;
        continue;
      }

      try {
        await prisma.generatedImage.update({
          where: { id: image.id },
          data: { isPublic: true }
        });

        console.log(`✅ Made public: ${image.r2Key}`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ Failed to update ${image.r2Key}:`, error);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Updated: ${updatedCount} images made public`);
    console.log(`  Already public: ${alreadyPublicCount} images`);
    console.log(`  Total R2 images: ${r2Images.length}`);

    if (updatedCount > 0) {
      console.log('\n🎉 Successfully made R2 images public!');
      console.log('These images will now appear in the public gallery for all users.');
    }

  } catch (error) {
    console.error('❌ Error making R2 images public:', error);
  }
}

makeR2ImagesPublic()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ R2 images public status update complete');
    process.exit(0);
  }); 