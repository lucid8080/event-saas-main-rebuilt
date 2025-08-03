#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔗 Manual Google OAuth Linking\n');

async function linkGoogleManual() {
  try {
    const targetEmail = 'lucid8080@gmail.com';
    const googleAccountId = process.argv[3]; // Get from command line argument

    if (!googleAccountId) {
      console.log('❌ Please provide your Google Account ID');
      console.log('Usage: npm run link:google:manual <google_account_id>');
      console.log('');
      console.log('💡 To get your Google Account ID:');
      console.log('1. Sign in with Google at: http://localhost:3000/login');
      console.log('2. Check the browser console for account details');
      console.log('3. Or check the database after signing in');
      return;
    }

    console.log(`🔗 Linking Google Account ID: ${googleAccountId}`);
    console.log(`📧 To user: ${targetEmail}`);

    // Find the existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { accounts: true }
    });

    if (!existingUser) {
      console.log('❌ Existing user not found');
      return;
    }

    console.log(`✅ Found existing user: ${existingUser.email}`);
    console.log(`   Role: ${existingUser.role}`);
    console.log(`   Current OAuth accounts: ${existingUser.accounts.length}`);

    // Check if this Google account is already linked to another user
    const existingOAuthAccount = await prisma.account.findFirst({
      where: { 
        providerAccountId: googleAccountId,
        provider: 'google'
      },
      include: { user: true }
    });

    if (existingOAuthAccount) {
      console.log(`⚠️  This Google account is already linked to: ${existingOAuthAccount.user.email}`);
      
      if (existingOAuthAccount.user.email === targetEmail) {
        console.log('✅ The account is already correctly linked!');
        return;
      } else {
        console.log('❌ Cannot link - this Google account is linked to a different email');
        return;
      }
    }

    // Create the OAuth account link
    const newAccount = await prisma.account.create({
      data: {
        userId: existingUser.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: googleAccountId,
        refresh_token: null,
        access_token: null,
        expires_at: null,
        token_type: null,
        scope: null,
        id_token: null,
        session_state: null,
      },
    });

    console.log(`✅ Successfully linked Google OAuth account: ${newAccount.id}`);
    console.log(`🎉 User ${targetEmail} can now sign in with Google!`);
    console.log('');
    console.log('💡 Next steps:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Click "Sign In with Google"');
    console.log('3. You\'ll be signed in with all your existing data');

  } catch (error) {
    console.error('❌ Error linking Google account:', error);
  }
}

linkGoogleManual()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Manual linking complete');
    process.exit(0);
  }); 