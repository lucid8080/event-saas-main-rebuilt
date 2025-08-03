#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllUsers() {
  console.log("🔍 Checking All Users in Database");
  console.log("================================\n");

  try {
    // Get ALL users (not just those with subscription data)
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${allUsers.length} total users:\n`);

    if (allUsers.length === 0) {
      console.log("❌ No users found in database");
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Unknown'} (${user.email})`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Credits: ${user.credits}`);
        console.log(`   Stripe Customer ID: ${user.stripeCustomerId || 'None'}`);
        console.log(`   Stripe Subscription ID: ${user.stripeSubscriptionId || 'None'}`);
        console.log(`   Stripe Price ID: ${user.stripePriceId || 'None'}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Updated: ${user.updatedAt}`);
        console.log("");
      });

      // Look specifically for the user's email
      const targetUser = allUsers.find(user => 
        user.email?.toLowerCase().includes('thinkbigliftstyle365@gmail.com') ||
        user.email?.toLowerCase().includes('thinkbiglifestyle365@gmail.com')
      );

      if (targetUser) {
        console.log("🎯 FOUND YOUR ACCOUNT:");
        console.log(`   Email: ${targetUser.email}`);
        console.log(`   Credits: ${targetUser.credits}`);
        console.log(`   Has Stripe Data: ${targetUser.stripeCustomerId ? 'Yes' : 'No'}`);
        console.log(`   Subscription: ${targetUser.stripeSubscriptionId ? 'Active' : 'None'}`);
        
        if (targetUser.credits === 0 && !targetUser.stripeCustomerId) {
          console.log("\n❌ ISSUE IDENTIFIED:");
          console.log("   - You have 0 credits");
          console.log("   - No Stripe subscription data");
          console.log("   - This suggests the Stripe checkout didn't complete or webhook failed");
        }
      } else {
        console.log("❌ YOUR EMAIL NOT FOUND:");
        console.log("   Email: thinkbigliftstyle365@gmail.com");
        console.log("   Possible reasons:");
        console.log("   - Account not created yet");
        console.log("   - Different email used for registration");
        console.log("   - Database connection issue");
      }
    }

  } catch (error) {
    console.error("❌ Database connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers()
  .then(() => {
    console.log("\n✅ User check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ User check failed:", error);
    process.exit(1);
  }); 