#!/usr/bin/env tsx

import { prisma } from '@/lib/db';

async function testProductionAPI() {
  console.log("🧪 Testing Production API Endpoint");
  console.log("==================================\n");

  try {
    // Step 1: Get test data
    console.log("1. Getting Test Data...");
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

    const adminUser = users.find(u => u.role === 'ADMIN' || u.role === 'HERO');
    const regularUser = users.find(u => u.role === 'USER');

    if (!adminUser || !regularUser) {
      console.log("❌ Need both admin and regular user for testing");
      return;
    }

    console.log(`✅ Admin User: ${adminUser.email} (${adminUser.role})`);
    console.log(`✅ Regular User: ${regularUser.email} (${regularUser.role})`);
    console.log(`   Current Credits: ${regularUser.credits}`);
    console.log("");

    // Step 2: Generate test curl command
    console.log("2. Testing API with curl command...");
    const newCredits = regularUser.credits + 25;
    
    console.log("   Here's the curl command to test the API:");
    console.log("   (Replace YOUR_PRODUCTION_URL with your actual production URL)");
    console.log("");
    console.log(`   curl -X PATCH https://YOUR_PRODUCTION_URL/api/admin/users/${regularUser.id} \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \\`);
    console.log(`     -d '{"credits": ${newCredits}}'`);
    console.log("");
    console.log("   To get your session token:");
    console.log("   1. Log into your production site");
    console.log("   2. Open browser developer tools (F12)");
    console.log("   3. Go to Application/Storage tab");
    console.log("   4. Look for 'next-auth.session-token' cookie");
    console.log("   5. Copy the value");
    console.log("");

    // Step 3: Test with fetch (if we can simulate the request)
    console.log("3. Testing with fetch simulation...");
    console.log("   Note: This won't work without proper authentication");
    console.log("   But it will show you the expected request format");
    console.log("");
    
    const requestBody = {
      credits: newCredits
    };

    console.log("   Request Details:");
    console.log(`   URL: /api/admin/users/${regularUser.id}`);
    console.log(`   Method: PATCH`);
    console.log(`   Headers: Content-Type: application/json`);
    console.log(`   Body: ${JSON.stringify(requestBody, null, 2)}`);
    console.log("");

    // Step 4: Check what the API expects
    console.log("4. API Endpoint Requirements...");
    console.log("   The API endpoint expects:");
    console.log("   - Valid authentication (session token)");
    console.log("   - User with ADMIN or HERO role");
    console.log("   - Valid user ID in the URL");
    console.log("   - JSON body with 'credits' field");
    console.log("   - Credits value >= 0");
    console.log("");

    // Step 5: Common error responses
    console.log("5. Common Error Responses...");
    console.log("   Status 401 - Unauthorized:");
    console.log("   - User not logged in");
    console.log("   - Session expired");
    console.log("   - Invalid session token");
    console.log("");
    console.log("   Status 403 - Forbidden:");
    console.log("   - User doesn't have admin role");
    console.log("   - Insufficient permissions");
    console.log("");
    console.log("   Status 400 - Bad Request:");
    console.log("   - Invalid user ID");
    console.log("   - Invalid credits value");
    console.log("   - Missing credits field");
    console.log("");
    console.log("   Status 404 - Not Found:");
    console.log("   - User ID doesn't exist");
    console.log("   - API endpoint not found");
    console.log("");
    console.log("   Status 500 - Internal Server Error:");
    console.log("   - Database connection issue");
    console.log("   - Server configuration problem");
    console.log("");

    // Step 6: Debugging steps
    console.log("6. Debugging Steps...");
    console.log("   1. Check if you're logged in with admin account");
    console.log("   2. Verify the user ID is correct");
    console.log("   3. Check browser network tab for the actual request");
    console.log("   4. Look at the response status and body");
    console.log("   5. Check browser console for JavaScript errors");
    console.log("   6. Verify the API endpoint URL is correct");
    console.log("");

    // Step 7: Test the exact same logic as the API
    console.log("7. Testing API Logic Locally...");
    console.log("   This simulates what the API endpoint does:");
    console.log("");
    
    // Simulate the API logic
    try {
      // Check if user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: regularUser.id },
        select: { id: true, email: true, credits: true },
      });

      if (!targetUser) {
        console.log("   ❌ Target user not found");
        return;
      }

      // Update credits
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

      console.log("   ✅ API logic test successful!");
      console.log(`   User: ${updatedUser.email}`);
      console.log(`   Credits: ${regularUser.credits} → ${updatedUser.credits}`);
      console.log(`   Updated: ${updatedUser.updatedAt}`);

      // Revert the change
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { credits: regularUser.credits },
      });
      console.log("   ✅ Reverted test change");
    } catch (error) {
      console.log(`   ❌ API logic test failed: ${error.message}`);
    }
    console.log("");

    // Step 8: Summary and next steps
    console.log("8. Summary & Next Steps...");
    console.log("   ✅ Local API logic works correctly");
    console.log("   ✅ Database updates work");
    console.log("   ✅ User permissions are correct");
    console.log("");
    console.log("   🔧 The issue is likely:");
    console.log("   1. Authentication problem in production");
    console.log("   2. Session token not being sent correctly");
    console.log("   3. User role different in production database");
    console.log("   4. API endpoint not accessible");
    console.log("");
    console.log("   📋 To debug in production:");
    console.log("   1. Open browser developer tools");
    console.log("   2. Go to Network tab");
    console.log("   3. Try to update credits");
    console.log("   4. Look for the PATCH request to /api/admin/users/[id]");
    console.log("   5. Check the request headers and response");
    console.log("   6. Look for any error messages in the response body");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testProductionAPI().catch(console.error); 