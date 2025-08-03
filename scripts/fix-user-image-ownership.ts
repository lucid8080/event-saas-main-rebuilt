#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔧 Fixing User Image Ownership...\n');

async function fixUserImageOwnership() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    
    // Find the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        generatedImages: true
      }
    });

    if (!currentUser) {
      console.log('❌ Current user not found');
      return;
    }

    console.log(`Current user: ${currentUser.email} (ID: ${currentUser.id})`);
    console.log(`Current user images: ${currentUser.generatedImages.length}`);

    // Find all images that belong to the old user ID
    const oldUserId = 'cmdtnz0g70000oosf1uxkcpgc';
    const oldUserImages = await prisma.generatedImage.findMany({
      where: { userId: oldUserId },
      include: { user: true }
    });

    console.log(`\nFound ${oldUserImages.length} images with old user ID: ${oldUserId}`);

    if (oldUserImages.length === 0) {
      console.log('✅ No images to transfer');
      return;
    }

    // Transfer all images to current user
    console.log('\n🔄 Transferring images to current user...');
    const updateResult = await prisma.generatedImage.updateMany({
      where: { userId: oldUserId },
      data: { userId: currentUser.id }
    });

    console.log(`✅ Transferred ${updateResult.count} images`);

    // Verify the transfer
    const updatedUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        generatedImages: true
      }
    });

    console.log(`\n📊 Updated user status:`);
    console.log(`   Email: ${updatedUser?.email}`);
    console.log(`   Role: ${updatedUser?.role}`);
    console.log(`   Total images: ${updatedUser?.generatedImages.length}`);

    // Check R2 images specifically
    const r2Images = updatedUser?.generatedImages.filter(img => img.r2Key) || [];
    console.log(`   R2 images: ${r2Images.length}`);

    // Check public images
    const publicImages = updatedUser?.generatedImages.filter(img => img.isPublic) || [];
    console.log(`   Public images: ${publicImages.length}`);

    console.log('\n🎉 Image ownership fixed!');
    console.log('💡 You should now see all your images in the gallery and admin panel.');

  } catch (error) {
    console.error('❌ Error fixing image ownership:', error);
  }
}

fixUserImageOwnership()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Image ownership fix complete');
    process.exit(0);
  }); 