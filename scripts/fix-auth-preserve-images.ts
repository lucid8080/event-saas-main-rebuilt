#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔐 Fixing Authentication While Preserving Images...\n');

async function fixAuthPreserveImages() {
  try {
    const oldEmail = 'lucid8080@gmail.com';
    const newEmail = 'lucid8080+new@gmail.com'; // Temporary email
    
    // Find the current user and their images
    const currentUser = await prisma.user.findUnique({
      where: { email: oldEmail },
      include: {
        generatedImages: true,
        accounts: true
      }
    });

    if (!currentUser) {
      console.log('❌ User not found');
      return;
    }

    console.log(`Found user: ${currentUser.email}`);
    console.log(`Role: ${currentUser.role}`);
    console.log(`Images: ${currentUser.generatedImages.length}`);
    console.log(`OAuth accounts: ${currentUser.accounts.length}`);

    // Create a new user with the same role
    console.log('\n🔄 Creating new user account...');
    const newUser = await prisma.user.create({
      data: {
        email: newEmail,
        name: currentUser.name || 'Admin User',
        role: currentUser.role,
      }
    });

    console.log(`✅ Created new user: ${newUser.email}`);

    // Transfer all images to the new user
    console.log('\n📸 Transferring images to new user...');
    const updateResult = await prisma.generatedImage.updateMany({
      where: { userId: currentUser.id },
      data: { userId: newUser.id }
    });

    console.log(`✅ Transferred ${updateResult.count} images`);

    // Delete the old user (now safe since images are transferred)
    console.log('\n🗑️  Deleting old user account...');
    await prisma.user.delete({
      where: { id: currentUser.id }
    });

    console.log('✅ Old user account deleted');

    // Update the new user's email to the original email
    console.log('\n📧 Updating email to original...');
    await prisma.user.update({
      where: { id: newUser.id },
      data: { email: oldEmail }
    });

    console.log('✅ Email updated to original');

    console.log('\n🎉 Authentication Fixed Successfully!');
    console.log('\n💡 Next Steps:');
    console.log('1. Go to: http://localhost:3000/register');
    console.log('2. Create a new account with: lucid8080@gmail.com');
    console.log('3. All your R2 images will be preserved');
    console.log('4. After registration, run: npm run make:admin');

  } catch (error) {
    console.error('❌ Error fixing authentication:', error);
  }
}

fixAuthPreserveImages()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Authentication fix complete');
    process.exit(0);
  }); 