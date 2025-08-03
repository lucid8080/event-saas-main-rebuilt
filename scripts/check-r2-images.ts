#!/usr/bin/env tsx

import { prisma } from '../lib/db';

console.log('📊 Checking R2 Images in Database...\n');

async function checkR2Images() {
  try {
    // Get total images
    const totalImages = await prisma.generatedImage.count();
    console.log(`Total images in database: ${totalImages}`);

    // Get images with R2 keys
    const r2Images = await prisma.generatedImage.findMany({
      where: { r2Key: { not: null } },
      select: {
        id: true,
        r2Key: true,
        url: true,
        createdAt: true,
        userId: true
      },
      take: 10
    });

    console.log(`Images with R2 keys: ${r2Images.length}`);
    console.log(`R2 integration rate: ${totalImages > 0 ? Math.round((r2Images.length / totalImages) * 100) : 0}%`);

    if (r2Images.length > 0) {
      console.log('\n📋 Recent R2 Images:');
      r2Images.forEach((image, index) => {
        console.log(`  ${index + 1}. ID: ${image.id}`);
        console.log(`     R2 Key: ${image.r2Key}`);
        console.log(`     Created: ${image.createdAt.toISOString()}`);
        console.log(`     User ID: ${image.userId}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No R2 images found');
      console.log('💡 This could mean:');
      console.log('  - Images are not being uploaded to R2');
      console.log('  - R2 keys are not being saved to database');
      console.log('  - Database migration for R2 support not applied');
    }

    // Check for images without R2 keys
    const nonR2Images = await prisma.generatedImage.count({
      where: { r2Key: null }
    });

    if (nonR2Images > 0) {
      console.log(`\n📋 Images without R2 keys: ${nonR2Images}`);
      console.log('💡 These images are stored locally or in other storage');
    }

    // Check recent image generation
    const recentImages = await prisma.generatedImage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        r2Key: true,
        createdAt: true
      }
    });

    console.log('\n📋 Recent Image Generation:');
    recentImages.forEach((image, index) => {
      const hasR2 = image.r2Key ? '✅ R2' : '❌ No R2';
      console.log(`  ${index + 1}. ID: ${image.id} - ${hasR2} - ${image.createdAt.toISOString()}`);
    });

  } catch (error) {
    console.error('❌ Error checking R2 images:', error);
  }
}

checkR2Images()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ R2 image check complete');
    process.exit(0);
  }); 