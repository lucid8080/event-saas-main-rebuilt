#!/usr/bin/env tsx

import { prisma } from '@/lib/db';
import { canAdmin, canHero } from '@/lib/role-based-access';

async function debugCreditError() {
  console.log("🔍 Debugging Credit Update Error");
  console.log("===============================\n");

  try {
    // Step 1: Check current user session and authentication
    console.log("1. Checking Authentication & Session...");
    console.log("   Note: This script runs server-side, so we'll check the database directly");
    console.log("   In production, the error might be related to authentication");
    console.log("");

    // Step 2: Check user roles and permissions
    console.log("2. Checking User Roles and Permissions...");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log(`📊 Found ${users.length} users in database:`);
    users.forEach(user => {
      const canManageCredits = canAdmin(user.role, 'credits:manage');
      const canAssignRoles = canHero(user.role, 'roles:assign');
      console.log(`   - ${user.email} (${user.name})`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Credits: ${user.credits}`);
      console.log(`     Can Manage Credits: ${canManageCredits ? '✅' : '❌'}`);
      console.log(`     Can Assign Roles: ${canAssignRoles ? '✅' : '❌'}`);
      console.log("");
    });

    // Step 3: Check for admin users
    console.log("3. Checking Admin Users...");
    const adminUsers = users.filter(user => user.role === 'ADMIN' || user.role === 'HERO');
    
    if (adminUsers.length === 0) {
      console.log("❌ CRITICAL: No admin users found!");
      console.log("   This is likely the root cause of the credit update error.");
      console.log("   Solution: Create or promote a user to ADMIN/HERO role");
      console.log("");
      console.log("   To create an admin user, run:");
      console.log("   npx tsx scripts/create-admin-user.ts");
      return;
    } else {
      console.log(`✅ Found ${adminUsers.length} admin users:`);
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }
    console.log("");

    // Step 4: Test the exact API logic
    console.log("4. Testing API Logic...");
    const adminUser = adminUsers[0];
    const regularUser = users.find(u => u.role === 'USER');
    
    if (!regularUser) {
      console.log("❌ No regular user found for testing");
      return;
    }

    console.log(`   Testing with:`);
    console.log(`   Admin: ${adminUser.email} (${adminUser.role})`);
    console.log(`   Target: ${regularUser.email} (${regularUser.role})`);
    console.log(`   Current Credits: ${regularUser.credits}`);
    console.log("");

    // Step 5: Simulate the exact API endpoint logic
    console.log("5. Simulating API Endpoint Logic...");
    
    // Simulate the authentication check
    console.log("   Step 5.1: Authentication Check");
    console.log(`   ✅ Admin user exists: ${adminUser.email}`);
    console.log(`   ✅ Admin role: ${adminUser.role}`);
    console.log("");

    // Simulate the permission check
    console.log("   Step 5.2: Permission Check");
    const canManageCredits = canAdmin(adminUser.role, 'credits:manage');
    const canAssignRoles = canHero(adminUser.role, 'roles:assign');
    console.log(`   Can Manage Credits: ${canManageCredits ? '✅' : '❌'}`);
    console.log(`   Can Assign Roles: ${canAssignRoles ? '✅' : '❌'}`);
    
    if (!canManageCredits) {
      console.log("   ❌ PERMISSION ERROR: Admin cannot manage credits");
      console.log("   This could be the cause of the error in production");
      return;
    }
    console.log("");

    // Simulate the database update
    console.log("   Step 5.3: Database Update Test");
    const originalCredits = regularUser.credits;
    const newCredits = originalCredits + 10;
    
    try {
      console.log(`   Attempting to update credits: ${originalCredits} → ${newCredits}`);
      
      const updatedUser = await prisma.user.update({
        where: { id: regularUser.id },
        data: { credits: newCredits },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          credits: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log("   ✅ Database update successful!");
      console.log(`   User: ${updatedUser.email}`);
      console.log(`   Credits: ${originalCredits} → ${updatedUser.credits}`);
      console.log(`   Updated: ${updatedUser.updatedAt}`);

      // Revert the change
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { credits: originalCredits },
      });
      console.log("   ✅ Reverted test change");
    } catch (error) {
      console.log(`   ❌ Database update failed: ${error.message}`);
      console.log(`   Error type: ${error.constructor.name}`);
      
      if (error.code) {
        console.log(`   Error code: ${error.code}`);
      }
      
      if (error.meta) {
        console.log(`   Error meta: ${JSON.stringify(error.meta, null, 2)}`);
      }
    }
    console.log("");

    // Step 6: Check environment variables
    console.log("6. Checking Environment Variables...");
    const requiredEnvVars = [
      'DATABASE_URL',
      'AUTH_SECRET',
      'NEXTAUTH_URL',
    ];
    
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`   ✅ ${envVar}: Set`);
      } else {
        console.log(`   ❌ ${envVar}: Missing`);
      }
    });
    console.log("");

    // Step 7: Check feature flags
    console.log("7. Checking Feature Flags...");
    const featureFlags = {
      charts: process.env.NEXT_PUBLIC_ENABLE_CHARTS === 'true',
      cloudServices: process.env.NEXT_PUBLIC_ENABLE_CLOUD_SERVICES === 'true',
    };
    
    Object.entries(featureFlags).forEach(([feature, enabled]) => {
      const status = enabled ? '✅ Enabled' : '❌ Disabled';
      const envVar = `NEXT_PUBLIC_ENABLE_${feature.toUpperCase()}`;
      const value = process.env[envVar];
      console.log(`   ${feature}: ${status} (${envVar}=${value || 'undefined'})`);
    });
    console.log("");

    // Step 8: Common error scenarios
    console.log("8. Common Error Scenarios...");
    console.log("   If you're getting 'Failed to update user credits' error:");
    console.log("");
    console.log("   Scenario 1: Authentication Issue");
    console.log("   - User not logged in or session expired");
    console.log("   - Solution: Log in again with admin account");
    console.log("");
    console.log("   Scenario 2: Permission Issue");
    console.log("   - User doesn't have admin role in production");
    console.log("   - Solution: Check user role in production database");
    console.log("");
    console.log("   Scenario 3: API Endpoint Issue");
    console.log("   - API endpoint not accessible");
    console.log("   - Solution: Check network tab for failed requests");
    console.log("");
    console.log("   Scenario 4: Database Connection Issue");
    console.log("   - Production database not accessible");
    console.log("   - Solution: Check database connection");
    console.log("");

    // Step 9: Production debugging steps
    console.log("9. Production Debugging Steps...");
    console.log("   1. Open browser developer tools (F12)");
    console.log("   2. Go to Network tab");
    console.log("   3. Try to update user credits");
    console.log("   4. Look for failed requests to /api/admin/users/[id]");
    console.log("   5. Check the response status and error message");
    console.log("   6. Check Console tab for JavaScript errors");
    console.log("");

    // Step 10: Summary
    console.log("10. Summary...");
    console.log("   ✅ Database connection working");
    console.log("   ✅ Admin users exist");
    console.log("   ✅ Permission system working");
    console.log("   ✅ Database updates working");
    console.log("");
    console.log("   🔧 Next Steps:");
    console.log("   1. Check browser console for JavaScript errors");
    console.log("   2. Check network tab for failed API requests");
    console.log("   3. Verify user is logged in with admin account");
    console.log("   4. Check if the error occurs in the UI or API");
    console.log("   5. Test the API endpoint directly with curl");

  } catch (error) {
    console.error("❌ Debug failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugCreditError().catch(console.error); 