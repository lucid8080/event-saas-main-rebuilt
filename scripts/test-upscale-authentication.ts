#!/usr/bin/env tsx

import { prisma } from '@/lib/db';
import { auth } from '@/auth';

async function testUpscaleAuthentication() {
  console.log('🔍 Upscale Authentication Test');
  console.log('==============================\n');

  try {
    // Step 1: Check the specific user
    console.log('1. Checking user dre380@gmail.com...');
    const user = await prisma.user.findUnique({
      where: { email: 'dre380@gmail.com' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        credits: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Credits: ${user.credits}`);
    console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
    console.log(`   OAuth Accounts: ${user.accounts.length}`);

    // Step 2: Find an image to test with
    console.log('\n2. Finding test image...');
    const testImage = await prisma.generatedImage.findFirst({
      where: { 
        userId: user.id,
        isUpscaled: false,
        upscaledImageId: null
      },
      select: {
        id: true,
        url: true,
        eventType: true,
        userId: true
      }
    });

    if (!testImage) {
      console.log('❌ No suitable test image found');
      return;
    }

    console.log('✅ Test image found:');
    console.log(`   ID: ${testImage.id}`);
    console.log(`   Event Type: ${testImage.eventType}`);
    console.log(`   User ID: ${testImage.userId}`);

    // Step 3: Simulate the upscale API call
    console.log('\n3. Simulating upscale API authentication...');
    
    // This simulates what happens in the upscale API route
    const session = await auth();
    
    console.log('Session check:');
    console.log(`   Session exists: ${!!session}`);
    console.log(`   User ID in session: ${session?.user?.id || 'undefined'}`);
    console.log(`   Expected user ID: ${user.id}`);
    console.log(`   Match: ${session?.user?.id === user.id ? '✅' : '❌'}`);

    if (!session?.user?.id) {
      console.log('\n❌ AUTHENTICATION FAILURE DETECTED');
      console.log('   Session is null or user ID is missing');
      console.log('   This explains the 403 Forbidden error');
      
      console.log('\n🔧 Possible Causes:');
      console.log('1. Session expired or invalid');
      console.log('2. User not properly signed in');
      console.log('3. Authentication token issues');
      console.log('4. Browser session problems');
      
      console.log('\n🔧 Solutions:');
      console.log('1. User should sign out and sign back in');
      console.log('2. Clear browser cookies and cache');
      console.log('3. Try using Google OAuth instead of email/password');
      console.log('4. Check if session token is valid in browser');
      
      return;
    }

    if (session.user.id !== user.id) {
      console.log('\n❌ USER ID MISMATCH');
      console.log('   Session user ID does not match expected user ID');
      console.log('   This could cause authorization issues');
      return;
    }

    // Step 4: Check if user has enough credits
    console.log('\n4. Checking credits...');
    if (user.credits <= 0) {
      console.log('❌ User has no credits');
      console.log('   This would cause a 402 Payment Required error');
      return;
    }

    console.log(`✅ User has ${user.credits} credits (sufficient for upscaling)`);

    // Step 5: Check image ownership
    console.log('\n5. Checking image ownership...');
    if (testImage.userId !== user.id) {
      console.log('❌ Image ownership mismatch');
      console.log('   This would cause a 403 Forbidden error');
      return;
    }

    console.log('✅ User owns the image');

    // Step 6: Summary
    console.log('\n6. Authentication Summary...');
    console.log('✅ All checks passed - upscaling should work');
    console.log('   - User authenticated: ✅');
    console.log('   - User has credits: ✅');
    console.log('   - User owns image: ✅');
    console.log('   - Image can be upscaled: ✅');

    console.log('\n💡 If user is still getting 403 errors:');
    console.log('1. Check browser session - try signing out and back in');
    console.log('2. Clear browser cookies and cache');
    console.log('3. Try using incognito/private mode');
    console.log('4. Check if there are any browser extensions interfering');
    console.log('5. Try using Google OAuth instead of email/password');

  } catch (error) {
    console.error('❌ Error during authentication test:', error);
  }
}

testUpscaleAuthentication()
  .then(() => {
    console.log('\n✅ Authentication test complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Authentication test failed:', error);
    process.exit(1);
  });
