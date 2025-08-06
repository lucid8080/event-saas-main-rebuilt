#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function runtimeAuthFix() {
  console.log('🔧 Runtime Authentication Fix');
  console.log('=============================\n');

  try {
    // Step 1: Check current users
    console.log('1. Checking Current Users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`     OAuth Accounts: ${user.accounts.length}`);
      user.accounts.forEach(account => {
        console.log(`       - ${account.provider}: ${account.providerAccountId}`);
      });
      console.log('');
    });

    // Step 2: Fix email verification for all users
    console.log('2. Fixing Email Verification...');
    let fixedCount = 0;
    
    for (const user of users) {
      if (!user.emailVerified) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              emailVerified: new Date(),
              updatedAt: new Date()
            },
          });
          console.log(`   ✅ Fixed email verification for ${user.email}`);
          fixedCount++;
        } catch (error) {
          console.log(`   ❌ Failed to fix ${user.email}: ${error}`);
        }
      } else {
        console.log(`   ✅ ${user.email} already verified`);
      }
    }

    console.log(`\n📊 Email verification fix complete: ${fixedCount} users updated`);

    // Step 3: Ensure admin user exists
    console.log('\n3. Ensuring Admin User...');
    const adminUser = users.find(u => u.role === 'HERO' || u.role === 'ADMIN');
    
    if (!adminUser) {
      console.log('   ❌ No admin user found');
      console.log('   💡 You need to create an admin user manually');
      console.log('   Steps:');
      console.log('   1. Go to your production website');
      console.log('   2. Register with your email');
      console.log('   3. Run this script again');
    } else {
      console.log(`   ✅ Admin user found: ${adminUser.email} (${adminUser.role})`);
      
      // Ensure admin user has proper role
      if (adminUser.role !== 'HERO') {
        try {
          await prisma.user.update({
            where: { id: adminUser.id },
            data: { 
              role: 'HERO',
              updatedAt: new Date()
            },
          });
          console.log(`   ✅ Promoted ${adminUser.email} to HERO role`);
        } catch (error) {
          console.log(`   ❌ Failed to promote ${adminUser.email}: ${error}`);
        }
      }
    }

    // Step 4: Test authentication setup
    console.log('\n4. Testing Authentication Setup...');
    const verifiedUsers = await prisma.user.findMany({
      where: { emailVerified: { not: null } },
      select: { id: true, email: true, role: true, emailVerified: true }
    });

    console.log(`   ✅ ${verifiedUsers.length} users with verified emails`);
    
    if (verifiedUsers.length > 0) {
      console.log('   ✅ Authentication should work properly now');
      console.log('\n🎉 Runtime authentication fix completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Sign out of your production website');
      console.log('   2. Clear browser cache/cookies');
      console.log('   3. Sign in again with Google OAuth');
      console.log('   4. Try applying credits to users');
    } else {
      console.log('   ❌ No users with verified emails found');
      console.log('   💡 This might indicate a deeper issue');
    }

  } catch (error) {
    console.error('❌ Runtime auth fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
runtimeAuthFix(); 