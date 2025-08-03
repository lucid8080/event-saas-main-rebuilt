#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔗 Merging Google OAuth Accounts...\n');

async function mergeGoogleAccounts() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    const tempEmail = 'lucid8080+temp@gmail.com';
    
    // Find both users
    const googleUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { accounts: true }
    });

    const originalUser = await prisma.user.findUnique({
      where: { email: tempEmail },
      include: { 
        generatedImages: true,
        accounts: true
      }
    });

    if (!googleUser) {
      console.log('❌ No Google OAuth user found');
      console.log('💡 Please sign in with Google first');
      return;
    }

    if (!originalUser) {
      console.log('❌ No original user found');
      return;
    }

    console.log('📊 Found Users:');
    console.log(`Google User: ${googleUser.email} (${googleUser.accounts.length} OAuth accounts)`);
    console.log(`Original User: ${originalUser.email} (${originalUser.generatedImages.length} images)`);

    // Transfer OAuth accounts to original user
    console.log('\n🔄 Transferring OAuth accounts...');
    for (const account of googleUser.accounts) {
      await prisma.account.update({
        where: { id: account.id },
        data: { userId: originalUser.id }
      });
      console.log(`✅ Transferred: ${account.provider} (${account.providerAccountId})`);
    }

    // Delete the Google user
    console.log('\n🗑️  Deleting Google user...');
    await prisma.user.delete({
      where: { id: googleUser.id }
    });
    console.log('✅ Deleted Google user');

    // Restore original email
    console.log('\n📧 Restoring original email...');
    await prisma.user.update({
      where: { id: originalUser.id },
      data: { email: targetEmail }
    });
    console.log('✅ Restored original email');

    console.log('\n🎉 Successfully merged accounts!');
    console.log('💡 You can now sign in with Google and access all your images.');
    console.log('\n📋 Next Steps:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Click "Sign In with Google"');
    console.log('3. You\'ll be signed in with all your existing data');

  } catch (error) {
    console.error('❌ Error merging accounts:', error);
  }
}

mergeGoogleAccounts()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Account merge complete');
    process.exit(0);
  }); 