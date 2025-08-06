#!/usr/bin/env tsx

import { prisma } from '@/lib/db';
import { canAdmin, canHero } from '@/lib/role-based-access';

async function productionCreditDebug() {
  console.log('🔍 Production Credit Application Debug');
  console.log('=====================================\n');

  try {
    // Step 1: Check environment variables
    console.log('1. Checking Environment Variables...');
    const criticalEnvVars = [
      'DATABASE_URL',
      'AUTH_SECRET',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
      'R2_ENDPOINT',
    ];

    criticalEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        const maskedValue = envVar.includes('SECRET') || envVar.includes('KEY') 
          ? `${value.substring(0, 8)}...` 
          : value;
        console.log(`   ✅ ${envVar}: ${maskedValue}`);
      } else {
        console.log(`   ❌ ${envVar}: Not set`);
      }
    });
    console.log('');

    // Step 2: Check feature flags
    console.log('2. Checking Feature Flags...');
    const featureFlags = [
      'NEXT_PUBLIC_ENABLE_CHARTS',
      'NEXT_PUBLIC_ENABLE_ANIMATIONS',
      'NEXT_PUBLIC_ENABLE_CLOUD_SERVICES',
      'NEXT_PUBLIC_ENABLE_IMAGE_PROCESSING',
      'NEXT_PUBLIC_ENABLE_PERF_MONITORING',
    ];

    featureFlags.forEach(flag => {
      const value = process.env[flag];
      console.log(`   ${flag}: ${value || 'undefined (defaults to false)'}`);
    });
    console.log('');

    // Step 3: Check database connection
    console.log('3. Testing Database Connection...');
    try {
      await prisma.$connect();
      console.log('   ✅ Database connection successful');
      
      // Test a simple query
      const userCount = await prisma.user.count();
      console.log(`   ✅ User count: ${userCount}`);
    } catch (error) {
      console.log(`   ❌ Database connection failed: ${error}`);
      return;
    }
    console.log('');

    // Step 4: Check user roles and permissions
    console.log('4. Checking User Roles and Permissions...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        credits: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`   Found ${users.length} users:`);
    users.forEach(user => {
      const canManageCredits = canAdmin(user.role, 'credits:manage');
      const canHeroCredits = canHero(user.role, 'credits:manage');
      console.log(`   - ${user.email} (${user.name})`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`     Credits: ${user.credits}`);
      console.log(`     Can Admin Credits: ${canManageCredits ? '✅' : '❌'}`);
      console.log(`     Can Hero Credits: ${canHeroCredits ? '✅' : '❌'}`);
      console.log('');
    });

    // Step 5: Test credit update directly
    console.log('5. Testing Credit Update Directly...');
    const testUser = users.find(u => u.role === 'HERO' || u.role === 'ADMIN');
    if (testUser) {
      try {
        const originalCredits = testUser.credits;
        const newCredits = originalCredits + 1;
        
        const updatedUser = await prisma.user.update({
          where: { id: testUser.id },
          data: { credits: newCredits },
          select: { id: true, email: true, credits: true },
        });
        
        console.log(`   ✅ Credit update successful for ${updatedUser.email}`);
        console.log(`   Credits: ${originalCredits} → ${updatedUser.credits}`);
        
        // Revert the change
        await prisma.user.update({
          where: { id: testUser.id },
          data: { credits: originalCredits },
        });
        console.log(`   ✅ Reverted credits back to ${originalCredits}`);
      } catch (error) {
        console.log(`   ❌ Credit update failed: ${error}`);
      }
    } else {
      console.log('   ❌ No admin/hero user found to test with');
    }
    console.log('');

    // Step 6: Check API route structure
    console.log('6. Checking API Route Structure...');
    const fs = require('fs');
    const path = require('path');
    
    const apiRoutePath = path.join(process.cwd(), 'app', 'api', 'admin', 'users', '[id]', 'route.ts');
    if (fs.existsSync(apiRoutePath)) {
      console.log('   ✅ API route file exists');
      
      const routeContent = fs.readFileSync(apiRoutePath, 'utf8');
      if (routeContent.includes('credits:manage')) {
        console.log('   ✅ Credit management permission check found');
      } else {
        console.log('   ❌ Credit management permission check not found');
      }
      
      if (routeContent.includes('PATCH')) {
        console.log('   ✅ PATCH method found');
      } else {
        console.log('   ❌ PATCH method not found');
      }
    } else {
      console.log('   ❌ API route file not found');
    }
    console.log('');

    // Step 7: Summary and recommendations
    console.log('📊 Summary and Recommendations');
    console.log('==============================');
    
    const hasAdminUser = users.some(u => u.role === 'HERO' || u.role === 'ADMIN');
    const hasVerifiedEmails = users.some(u => u.emailVerified);
    const hasDatabaseAccess = true; // We got here, so DB is working
    
    console.log(`✅ Database Access: ${hasDatabaseAccess ? 'Working' : 'Failed'}`);
    console.log(`✅ Admin Users: ${hasAdminUser ? 'Found' : 'Not Found'}`);
    console.log(`✅ Verified Emails: ${hasVerifiedEmails ? 'Some' : 'None'}`);
    
    if (!hasAdminUser) {
      console.log('\n🔧 Recommendation: Create an admin user');
      console.log('   Run: npm run fix:email:verification:auto');
    }
    
    if (!hasVerifiedEmails) {
      console.log('\n🔧 Recommendation: Fix email verification');
      console.log('   Run: npm run fix:email:verification:auto');
    }
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Check browser developer tools (F12)');
    console.log('   2. Look at Network tab when applying credits');
    console.log('   3. Check for any error messages in Console tab');
    console.log('   4. Verify the PATCH request is being sent');
    console.log('   5. Check the response status code');

  } catch (error) {
    console.error('❌ Debug failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
productionCreditDebug(); 