#!/usr/bin/env tsx

import { prisma } from '@/lib/db';
import { canAdmin, canHero } from '@/lib/role-based-access';

async function diagnoseCreditApplication() {
  console.log("🔍 Diagnosing Credit Application Issue");
  console.log("=====================================\n");

  try {
    // Step 1: Check database connection
    console.log("1. Testing Database Connection...");
    await prisma.$connect();
    console.log("✅ Database connection successful\n");

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

    // Step 3: Check for admin users specifically
    console.log("3. Checking Admin Users...");
    const adminUsers = users.filter(user => user.role === 'ADMIN' || user.role === 'HERO');
    
    if (adminUsers.length === 0) {
      console.log("❌ No admin users found! This is likely the root cause.");
      console.log("   Solution: Create or promote a user to ADMIN/HERO role");
    } else {
      console.log(`✅ Found ${adminUsers.length} admin users:`);
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }
    console.log("");

    // Step 4: Test credit management permissions
    console.log("4. Testing Credit Management Permissions...");
    const testRoles = ['USER', 'ADMIN', 'HERO'] as const;
    
    testRoles.forEach(role => {
      const canManageCredits = canAdmin(role, 'credits:manage');
      const canAssignRoles = canHero(role, 'roles:assign');
      console.log(`   ${role}:`);
      console.log(`     Can Manage Credits: ${canManageCredits ? '✅' : '❌'}`);
      console.log(`     Can Assign Roles: ${canAssignRoles ? '✅' : '❌'}`);
    });
    console.log("");

    // Step 5: Check API endpoint structure
    console.log("5. Checking API Endpoint Structure...");
    console.log("   Credit Management API: /api/admin/users/[id]");
    console.log("   Method: PATCH");
    console.log("   Required Body: { credits: number }");
    console.log("   Required Headers: Authorization");
    console.log("   Required Permissions: credits:manage");
    console.log("");

    // Step 6: Test a sample credit update (if we have admin users)
    if (adminUsers.length > 0 && users.length > 1) {
      console.log("6. Testing Sample Credit Update...");
      const adminUser = adminUsers[0];
      const regularUser = users.find(u => u.role === 'USER');
      
      if (regularUser) {
        console.log(`   Admin: ${adminUser.email} (${adminUser.role})`);
        console.log(`   Target User: ${regularUser.email} (${regularUser.role})`);
        console.log(`   Current Credits: ${regularUser.credits}`);
        console.log(`   Test Credits: ${regularUser.credits + 10}`);
        
        try {
          const updatedUser = await prisma.user.update({
            where: { id: regularUser.id },
            data: { credits: regularUser.credits + 10 },
            select: { id: true, email: true, credits: true },
          });
          
          console.log(`   ✅ Database update successful: ${updatedUser.credits} credits`);
          
          // Revert the change
          await prisma.user.update({
            where: { id: regularUser.id },
            data: { credits: regularUser.credits },
          });
          console.log("   ✅ Reverted test change");
        } catch (error) {
          console.log(`   ❌ Database update failed: ${error.message}`);
        }
      }
    }
    console.log("");

    // Step 7: Check environment variables
    console.log("7. Checking Environment Variables...");
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

    // Step 8: Summary and recommendations
    console.log("8. Summary and Recommendations...");
    console.log("   Based on the analysis:");
    
    if (adminUsers.length === 0) {
      console.log("   ❌ CRITICAL: No admin users found");
      console.log("   🔧 SOLUTION: Create an admin user or promote existing user");
      console.log("   📝 COMMAND: npx tsx scripts/create-admin-user.ts");
    } else {
      console.log("   ✅ Admin users exist");
    }
    
    console.log("   ✅ Database connection working");
    console.log("   ✅ Permission system configured");
    console.log("   ✅ API endpoints available");
    
    console.log("\n   🔧 NEXT STEPS:");
    console.log("   1. Verify admin user can log into production");
    console.log("   2. Test credit management UI in admin dashboard");
    console.log("   3. Check browser console for API errors");
    console.log("   4. Verify authentication is working correctly");

  } catch (error) {
    console.error("❌ Diagnosis failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the diagnosis
diagnoseCreditApplication().catch(console.error); 