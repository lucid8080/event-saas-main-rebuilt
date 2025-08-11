#!/usr/bin/env tsx

import { auth } from "../auth";
import { prisma } from "../lib/db";

async function testCreditCheck() {
  console.log("🧪 Testing Credit Check Logic");
  console.log("=============================\n");

  try {
    // Test the exact same logic as generateImageV2
    console.log("1. Testing authentication...");
    const session = await auth();
    console.log("   Session exists:", !!session);
    console.log("   User ID:", session?.user?.id);
    console.log("   User email:", session?.user?.email);
    
    if (!session?.user?.id) {
      console.log("❌ No session found - this is the issue!");
      console.log("   Make sure you're logged in to the application");
      return;
    }
    
    console.log("✅ Authentication successful");

    console.log("\n2. Testing user lookup...");
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        email: true,
        credits: true, 
        watermarkEnabled: true 
      }
    });

    if (!user) {
      console.log("❌ User not found in database");
      console.log("   This could happen if the user was deleted or there's a session mismatch");
      return;
    }

    console.log("✅ User found in database");
    console.log("   User ID:", user.id);
    console.log("   User email:", user.email);
    console.log("   Credits:", user.credits);
    console.log("   Watermark enabled:", user.watermarkEnabled);

    console.log("\n3. Testing credit validation...");
    if (user.credits <= 0) {
      console.log("❌ Insufficient credits");
      console.log("   Current credits:", user.credits);
      console.log("   Need at least 1 credit to generate images");
    } else {
      console.log("✅ Sufficient credits");
      console.log("   Available credits:", user.credits);
    }

    console.log("\n4. Testing all users in database...");
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        credits: true
      }
    });
    
    console.log("   All users:");
    allUsers.forEach(u => {
      const match = u.id === session.user.id ? " ← CURRENT USER" : "";
      console.log(`     ${u.email}: ${u.credits} credits${match}`);
    });

    // Check if there's a mismatch between session user and database user
    const sessionUserInDb = allUsers.find(u => u.id === session.user.id);
    if (!sessionUserInDb) {
      console.log("\n❌ CRITICAL ISSUE: Session user not found in database!");
      console.log("   This suggests the session is pointing to a non-existent user");
    } else {
      console.log("\n✅ Session user found in database");
    }

  } catch (error) {
    console.error("❌ Error during credit check test:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCreditCheck();
