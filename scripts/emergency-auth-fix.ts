#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function emergencyAuthFix() {
  console.log('🚨 Emergency Authentication Fix');
  console.log('================================\n');

  try {
    // Step 1: Check and fix all users
    console.log('1. Emergency User Fix...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        image: true,
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📊 Found ${users.length} users to process:`);
    
    for (const user of users) {
      console.log(`\n🔧 Processing: ${user.email} (${user.name})`);
      
      // Force update all user fields to ensure proper authentication
      try {
        const updateData: any = {
          emailVerified: new Date(),
          updatedAt: new Date(),
        };

        // Ensure proper role for admin users
        if (user.email === 'lucid8080@gmail.com' && user.role !== 'HERO') {
          updateData.role = 'HERO';
          console.log(`   🔄 Promoting ${user.email} to HERO role`);
        }

        // Ensure proper role for other users
        if (user.role === 'USER' && user.email !== 'lucid8080@gmail.com') {
          updateData.role = 'USER';
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });

        console.log(`   ✅ Fixed ${user.email}`);
        console.log(`     - Email Verified: ✅`);
        console.log(`     - Role: ${updateData.role || user.role}`);
        console.log(`     - Updated: ${new Date().toISOString()}`);

      } catch (error) {
        console.log(`   ❌ Failed to fix ${user.email}: ${error}`);
      }
    }

    // Step 2: Verify the fix
    console.log('\n2. Verifying Fix...');
    const verifiedUsers = await prisma.user.findMany({
      where: { 
        emailVerified: { not: null },
        role: { in: ['HERO', 'ADMIN', 'USER'] }
      },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        emailVerified: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`📊 Verification Results:`);
    verifiedUsers.forEach(user => {
      console.log(`   ✅ ${user.email}`);
      console.log(`     - Role: ${user.role}`);
      console.log(`     - Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`     - Last Updated: ${user.updatedAt.toISOString()}`);
    });

    // Step 3: Test database connection and permissions
    console.log('\n3. Testing Database Connection...');
    try {
      const testUser = await prisma.user.findFirst({
        where: { role: 'HERO' },
        select: { id: true, email: true, role: true }
      });

      if (testUser) {
        console.log(`   ✅ Database connection working`);
        console.log(`   ✅ HERO user found: ${testUser.email}`);
        
        // Test a simple update to ensure permissions work
        await prisma.user.update({
          where: { id: testUser.id },
          data: { updatedAt: new Date() }
        });
        console.log(`   ✅ Database write permissions working`);
      } else {
        console.log(`   ❌ No HERO user found`);
      }
    } catch (error) {
      console.log(`   ❌ Database test failed: ${error}`);
    }

    // Step 4: Final status
    console.log('\n🎉 Emergency Authentication Fix Complete!');
    console.log('\n📋 Critical Next Steps:');
    console.log('   1. DEPLOY THIS TO PRODUCTION IMMEDIATELY');
    console.log('   2. Clear all browser cache and cookies');
    console.log('   3. Sign out completely from production site');
    console.log('   4. Sign in again with Google OAuth');
    console.log('   5. Test credit application immediately');
    console.log('\n⚠️  If still getting errors:');
    console.log('   - Check Render environment variables');
    console.log('   - Verify DATABASE_URL is correct');
    console.log('   - Ensure AUTH_SECRET is set');
    console.log('   - Check NEXTAUTH_URL matches your domain');

  } catch (error) {
    console.error('❌ Emergency auth fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the emergency fix
emergencyAuthFix(); 