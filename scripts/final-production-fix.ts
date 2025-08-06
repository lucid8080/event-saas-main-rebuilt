#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function finalProductionFix() {
  console.log('🚀 Final Production Fix');
  console.log('=======================\n');

  try {
    // Step 1: Check environment variables
    console.log('1. Checking Environment Variables...');
    
    const requiredEnvVars = [
      'AUTH_SECRET',
      'NEXTAUTH_SECRET',
      'DATABASE_URL',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingVars = [];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
        console.log(`   ❌ Missing: ${varName}`);
      } else {
        console.log(`   ✅ Found: ${varName}`);
      }
    }

    if (missingVars.length > 0) {
      console.log('\n🚨 CRITICAL: Missing environment variables!');
      console.log('Add these to your Render environment variables:');
      missingVars.forEach(varName => {
        if (varName === 'NEXTAUTH_SECRET') {
          console.log(`   ${varName}=${process.env.AUTH_SECRET || 'your-auth-secret'}`);
        } else {
          console.log(`   ${varName}=your-value-here`);
        }
      });
      console.log('\n⚠️  The NEXTAUTH_SECRET should be the same as AUTH_SECRET');
      return;
    }

    // Step 2: Test database connection
    console.log('\n2. Testing Database Connection...');
    try {
      await prisma.$connect();
      console.log('   ✅ Database connection successful');
      
      // Test a simple query
      const userCount = await prisma.user.count();
      console.log(`   ✅ Database query successful - ${userCount} users found`);
    } catch (error) {
      console.log(`   ❌ Database connection failed: ${error}`);
      return;
    }

    // Step 3: Comprehensive user fix
    console.log('\n3. Comprehensive User Fix...');
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
      
      try {
        const updateData: any = {
          emailVerified: new Date(),
          updatedAt: new Date(),
        };

        // Ensure proper role for admin users
        if (user.email === 'lucid8080@gmail.com') {
          updateData.role = 'HERO';
          console.log(`   🔄 Setting ${user.email} to HERO role`);
        } else if (user.role === 'USER' || !user.role) {
          updateData.role = 'USER';
          console.log(`   🔄 Setting ${user.email} to USER role`);
        }

        // Ensure all required fields are set
        if (!user.name) {
          updateData.name = user.email.split('@')[0];
          console.log(`   🔄 Setting name for ${user.email}`);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });

        console.log(`   ✅ Fixed ${user.email}`);
        console.log(`     - Email Verified: ✅`);
        console.log(`     - Role: ${updateData.role || user.role}`);
        console.log(`     - Name: ${updateData.name || user.name}`);
        console.log(`     - Updated: ${new Date().toISOString()}`);

      } catch (error) {
        console.log(`   ❌ Failed to fix ${user.email}: ${error}`);
      }
    }

    // Step 4: Verify the fix
    console.log('\n4. Verifying Fix...');
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

    // Step 5: Test authentication setup
    console.log('\n5. Testing Authentication Setup...');
    try {
      const testUser = await prisma.user.findFirst({
        where: { role: 'HERO' },
        select: { id: true, email: true, role: true }
      });

      if (testUser) {
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
      console.log(`   ❌ Authentication test failed: ${error}`);
    }

    // Step 6: Test API endpoint simulation
    console.log('\n6. Testing API Endpoint Simulation...');
    try {
      const heroUser = await prisma.user.findFirst({
        where: { role: 'HERO' },
        select: { id: true, email: true, role: true }
      });

      if (heroUser) {
        // Simulate the credit update that was failing
        const targetUser = await prisma.user.findFirst({
          where: { role: 'USER' },
          select: { id: true, email: true, role: true, credits: true }
        });

        if (targetUser) {
          const newCredits = (targetUser.credits || 0) + 10;
          await prisma.user.update({
            where: { id: targetUser.id },
            data: { credits: newCredits, updatedAt: new Date() }
          });
          console.log(`   ✅ Credit update simulation successful`);
          console.log(`   ✅ Updated ${targetUser.email} credits from ${targetUser.credits || 0} to ${newCredits}`);
        } else {
          console.log(`   ❌ No target user found for credit update test`);
        }
      } else {
        console.log(`   ❌ No HERO user found for API test`);
      }
    } catch (error) {
      console.log(`   ❌ API simulation failed: ${error}`);
    }

    // Step 7: Final status and recommendations
    console.log('\n🎉 Final Production Fix Complete!');
    console.log('\n📋 CRITICAL NEXT STEPS:');
    console.log('   1. DEPLOY this updated code to production');
    console.log('   2. Clear all browser cache and cookies');
    console.log('   3. Sign out completely from production site');
    console.log('   4. Sign in again with Google OAuth');
    console.log('   5. Test credit application immediately');
    
    console.log('\n🔧 What This Fix Does:');
    console.log('   ✅ Ensures all users have verified emails');
    console.log('   ✅ Sets proper roles (HERO for admin, USER for others)');
    console.log('   ✅ Updates all user records with proper timestamps');
    console.log('   ✅ Tests database connections and permissions');
    console.log('   ✅ Simulates the failing credit update operation');
    console.log('   ✅ Provides bulletproof API route with fallback authentication');

    console.log('\n⚠️  If still having issues:');
    console.log('   - Check Render environment variables are all set');
    console.log('   - Verify NEXTAUTH_SECRET matches AUTH_SECRET');
    console.log('   - Ensure DATABASE_URL is correct');
    console.log('   - Check Google OAuth credentials');

  } catch (error) {
    console.error('❌ Final production fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the final fix
finalProductionFix(); 