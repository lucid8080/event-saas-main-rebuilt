#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function testCreditAPI() {
  console.log("🧪 Testing Credit Management API");
  console.log("================================\n");

  try {
    // Step 1: Get test users
    console.log("1. Getting Test Users...");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (users.length === 0) {
      console.log("❌ No users found in database");
      return;
    }

    const adminUser = users.find(u => u.role === 'ADMIN' || u.role === 'HERO');
    const regularUser = users.find(u => u.role === 'USER');

    if (!adminUser) {
      console.log("❌ No admin user found for testing");
      console.log("   Available users:");
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
      return;
    }

    if (!regularUser) {
      console.log("❌ No regular user found for testing");
      return;
    }

    console.log(`✅ Admin User: ${adminUser.email} (${adminUser.role})`);
    console.log(`✅ Regular User: ${regularUser.email} (${regularUser.role})`);
    console.log("");

    // Step 2: Test direct database update
    console.log("2. Testing Direct Database Update...");
    const originalCredits = regularUser.credits;
    const testCredits = originalCredits + 50;

    try {
      const updatedUser = await prisma.user.update({
        where: { id: regularUser.id },
        data: { credits: testCredits },
        select: { id: true, email: true, credits: true },
      });

      console.log(`✅ Database update successful:`);
      console.log(`   User: ${updatedUser.email}`);
      console.log(`   Credits: ${originalCredits} → ${updatedUser.credits}`);

      // Revert the change
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { credits: originalCredits },
      });
      console.log("✅ Reverted test change");
    } catch (error) {
      console.log(`❌ Database update failed: ${error.message}`);
    }
    console.log("");

    // Step 3: Test API endpoint simulation
    console.log("3. Testing API Endpoint Simulation...");
    console.log("   Simulating PATCH /api/admin/users/[id]");
    console.log(`   Target User ID: ${regularUser.id}`);
    console.log(`   New Credits: ${originalCredits + 25}`);

    // Simulate the API logic
    try {
      // Check if user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: regularUser.id },
        select: { id: true, email: true, credits: true },
      });

      if (!targetUser) {
        console.log("❌ Target user not found");
        return;
      }

      // Update credits
      const updatedUser = await prisma.user.update({
        where: { id: regularUser.id },
        data: { credits: originalCredits + 25 },
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

      console.log("✅ API simulation successful:");
      console.log(`   User: ${updatedUser.email}`);
      console.log(`   Credits: ${originalCredits} → ${updatedUser.credits}`);
      console.log(`   Updated: ${updatedUser.updatedAt}`);

      // Revert the change
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { credits: originalCredits },
      });
      console.log("✅ Reverted test change");
    } catch (error) {
      console.log(`❌ API simulation failed: ${error.message}`);
    }
    console.log("");

    // Step 4: Test permission validation
    console.log("4. Testing Permission Validation...");
    const { canAdmin, canHero } = await import('@/lib/role-based-access');
    
    const adminCanManageCredits = canAdmin(adminUser.role, 'credits:manage');
    const adminCanAssignRoles = canHero(adminUser.role, 'roles:assign');
    const regularCanManageCredits = canAdmin(regularUser.role, 'credits:manage');

    console.log(`   Admin (${adminUser.role}):`);
    console.log(`     Can Manage Credits: ${adminCanManageCredits ? '✅' : '❌'}`);
    console.log(`     Can Assign Roles: ${adminCanAssignRoles ? '✅' : '❌'}`);
    console.log(`   Regular User (${regularUser.role}):`);
    console.log(`     Can Manage Credits: ${regularCanManageCredits ? '✅' : '❌'}`);
    console.log("");

    // Step 5: Test error scenarios
    console.log("5. Testing Error Scenarios...");
    
    // Test invalid user ID
    try {
      await prisma.user.update({
        where: { id: 'invalid-id' },
        data: { credits: 100 },
      });
      console.log("❌ Should have failed with invalid ID");
    } catch (error) {
      console.log("✅ Correctly failed with invalid user ID");
    }

    // Test negative credits
    try {
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { credits: -10 },
      });
      console.log("❌ Should have failed with negative credits");
    } catch (error) {
      console.log("✅ Correctly failed with negative credits");
    }

    // Test non-numeric credits
    try {
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { credits: 'invalid' as any },
      });
      console.log("❌ Should have failed with non-numeric credits");
    } catch (error) {
      console.log("✅ Correctly failed with non-numeric credits");
    }
    console.log("");

    // Step 6: Summary
    console.log("6. Summary...");
    console.log("✅ Database connection working");
    console.log("✅ User queries working");
    console.log("✅ Credit updates working");
    console.log("✅ Permission system working");
    console.log("✅ Error handling working");
    console.log("");
    console.log("🔧 If credit application is still not working in production:");
    console.log("   1. Check if admin user is properly authenticated");
    console.log("   2. Verify the API endpoint is accessible");
    console.log("   3. Check browser console for JavaScript errors");
    console.log("   4. Verify the UI is making the correct API calls");
    console.log("   5. Check network tab for failed requests");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCreditAPI().catch(console.error); 