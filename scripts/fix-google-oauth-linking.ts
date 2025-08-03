#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔗 Fixing Google OAuth Linking Issue...\n');

async function fixGoogleOAuthLinking() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    
    // Find all users with this email
    const allUsers = await prisma.user.findMany({
      where: { email: targetEmail },
      include: {
        accounts: true,
        generatedImages: true
      }
    });

    console.log(`Found ${allUsers.length} users with email: ${targetEmail}`);

    if (allUsers.length === 0) {
      console.log('❌ No users found with that email');
      return;
    }

    // Find the user with images (original user)
    const originalUser = allUsers.find(user => user.generatedImages.length > 0);
    const googleUser = allUsers.find(user => user.accounts.length > 0);

    if (!originalUser) {
      console.log('❌ No user found with existing images');
      return;
    }

    console.log('\n📊 User Analysis:');
    console.log(`Original User (with images):`);
    console.log(`  ID: ${originalUser.id}`);
    console.log(`  Role: ${originalUser.role}`);
    console.log(`  Images: ${originalUser.generatedImages.length}`);
    console.log(`  OAuth accounts: ${originalUser.accounts.length}`);

    if (googleUser) {
      console.log(`\nGoogle User (newly created):`);
      console.log(`  ID: ${googleUser.id}`);
      console.log(`  Role: ${googleUser.role}`);
      console.log(`  Images: ${googleUser.generatedImages.length}`);
      console.log(`  OAuth accounts: ${googleUser.accounts.length}`);
      
      googleUser.accounts.forEach(account => {
        console.log(`    - ${account.provider} (${account.providerAccountId})`);
      });
    }

    // If we have both users, merge them
    if (originalUser && googleUser && originalUser.id !== googleUser.id) {
      console.log('\n🔄 Merging users...');
      
      // Transfer OAuth accounts to original user
      for (const account of googleUser.accounts) {
        await prisma.account.update({
          where: { id: account.id },
          data: { userId: originalUser.id }
        });
        console.log(`✅ Transferred OAuth account: ${account.provider}`);
      }

      // Delete the duplicate Google user
      await prisma.user.delete({
        where: { id: googleUser.id }
      });
      console.log('✅ Deleted duplicate Google user');

      console.log('\n🎉 Successfully merged users!');
      console.log('💡 You can now sign in with Google and access all your images.');
      
    } else if (originalUser && !googleUser) {
      console.log('\n💡 No Google OAuth account found yet.');
      console.log('📝 Please try signing in with Google again, then run this script.');
      
    } else if (originalUser && googleUser && originalUser.id === googleUser.id) {
      console.log('\n✅ Users are already merged correctly!');
      console.log('💡 You should be able to sign in with Google now.');
    }

    console.log('\n🔧 Next Steps:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Click "Sign In with Google"');
    console.log('3. You should now be signed in with all your existing data');

  } catch (error) {
    console.error('❌ Error fixing Google OAuth linking:', error);
  }
}

fixGoogleOAuthLinking()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Google OAuth fix complete');
    process.exit(0);
  }); 