#!/usr/bin/env tsx

import 'dotenv/config';
import { prisma } from '../lib/db';

console.log('🔐 Fixing Authentication Issue...\n');

async function fixAuthenticationIssue() {
  try {
    // Find all users with their accounts
    const users = await prisma.user.findMany({
      include: {
        accounts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${users.length} users in database:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email || 'No email'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Accounts: ${user.accounts.length}`);
      
      if (user.accounts.length > 0) {
        user.accounts.forEach(account => {
          console.log(`     - ${account.provider} (${account.providerAccountId})`);
        });
      }
      console.log('');
    });

    // Check for the specific user (lucid8080@gmail.com)
    const targetUser = users.find(user => user.email === 'lucid8080@gmail.com');
    
    if (targetUser) {
      console.log('🎯 Target User Found:');
      console.log(`   Email: ${targetUser.email}`);
      console.log(`   Role: ${targetUser.role}`);
      console.log(`   Has OAuth accounts: ${targetUser.accounts.length > 0}`);
      
      if (targetUser.accounts.length > 0) {
        console.log('\n💡 Solution:');
        console.log('   You have an existing Google OAuth account.');
        console.log('   Please use "Sign In with Google" instead of email/password.');
        console.log('   Or, if you want to use email/password, we can reset your account.');
      } else {
        console.log('\n💡 Solution:');
        console.log('   You can use email/password sign-in.');
        console.log('   Or we can set up Google OAuth for easier access.');
      }
    } else {
      console.log('❌ User lucid8080@gmail.com not found in database');
      console.log('\n💡 Solution:');
      console.log('   You need to create a new account first.');
    }

    console.log('\n🔧 Available Solutions:');
    console.log('1. Use Google OAuth (recommended if you have existing account)');
    console.log('2. Reset your account and create new one');
    console.log('3. Link your email to existing OAuth account');
    console.log('4. Create a new admin account');

  } catch (error) {
    console.error('❌ Error checking authentication:', error);
  }
}

fixAuthenticationIssue()
  .catch(console.error)
  .finally(() => {
    console.log('\n✅ Authentication check complete');
    process.exit(0);
  }); 