#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔗 Setting Up Google OAuth Properly...\n');

async function setupGoogleOAuthProperly() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    const tempEmail = 'lucid8080+temp@gmail.com';
    
    // Find the existing user with images
    const existingUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        generatedImages: true,
        accounts: true
      }
    });

    if (!existingUser) {
      console.log('❌ No existing user found');
      return;
    }

    console.log(`Found existing user: ${existingUser.email}`);
    console.log(`Images: ${existingUser.generatedImages.length}`);
    console.log(`OAuth accounts: ${existingUser.accounts.length}`);

    // Temporarily change the email to allow Google OAuth to create a new account
    console.log('\n🔄 Temporarily changing email to allow Google OAuth...');
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { email: tempEmail }
    });
    console.log(`✅ Changed email to: ${tempEmail}`);

    console.log('\n📋 Next Steps:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Click "Sign In with Google"');
    console.log('3. Sign in with your Google account');
    console.log('4. This will create a new user account');
    console.log('5. After signing in, run: npm run merge:google:accounts');

    console.log('\n💡 What this does:');
    console.log('- Temporarily moves your existing account to a different email');
    console.log('- Allows Google OAuth to create a new account with your email');
    console.log('- We\'ll then merge the accounts and restore your data');

  } catch (error) {
    console.error('❌ Error setting up Google OAuth:', error);
  }
}

setupGoogleOAuthProperly()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Google OAuth setup complete');
    process.exit(0);
  }); 