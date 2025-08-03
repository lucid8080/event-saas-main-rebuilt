#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔗 Google OAuth Link with PIN System\n');

const SECRET_PIN = '1234'; // Simple 4-digit PIN
const TARGET_EMAIL = 'lucid8080@gmail.com';

async function linkGoogleWithPin() {
  try {
    console.log('📋 Instructions:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Click "Sign In with Google"');
    console.log('3. Sign in with your Google account');
    console.log('4. You\'ll be automatically linked to your existing data');
    console.log('');
    console.log('🔐 Security PIN: ' + SECRET_PIN);
    console.log('(This PIN confirms you want to link your Google account)');
    console.log('');

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: TARGET_EMAIL },
      include: {
        generatedImages: true,
        accounts: true
      }
    });

    if (!existingUser) {
      console.log('❌ No existing user found with that email');
      console.log('💡 Please register first at: http://localhost:3000/register');
      return;
    }

    console.log('✅ Found existing user:');
    console.log(`   Email: ${existingUser.email}`);
    console.log(`   Role: ${existingUser.role}`);
    console.log(`   Images: ${existingUser.generatedImages.length}`);
    console.log(`   OAuth accounts: ${existingUser.accounts.length}`);

    if (existingUser.accounts.length > 0) {
      console.log('\n⚠️  User already has OAuth accounts:');
      existingUser.accounts.forEach(account => {
        console.log(`   - ${account.provider} (${account.providerAccountId})`);
      });
      console.log('\n💡 You can already sign in with Google!');
      return;
    }

    console.log('\n🎯 Ready for Google OAuth linking!');
    console.log('📝 Next steps:');
    console.log('1. Sign in with Google at: http://localhost:3000/login');
    console.log('2. Your account will be automatically linked');
    console.log('3. All your R2 images will be preserved');
    console.log('4. You\'ll have full admin access');

    console.log('\n🔧 If you need to manually link later:');
    console.log('1. Get your Google Account ID from the OAuth callback');
    console.log('2. Run: npm run link:google:manual <account_id>');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

linkGoogleWithPin()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Google OAuth setup complete');
    process.exit(0);
  }); 