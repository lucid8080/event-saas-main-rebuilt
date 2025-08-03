#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickCheck() {
  console.log("🔍 Quick Database Check");
  console.log("======================\n");

  try {
    // Get all users with any subscription data
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { stripeSubscriptionId: { not: null } },
          { stripeCustomerId: { not: null } },
          { credits: { gt: 0 } }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        updatedAt: true
      }
    });

    console.log(`📊 Found ${users.length} users with subscription data:\n`);

    if (users.length === 0) {
      console.log("❌ No users found with subscription data");
      console.log("   This could mean:");
      console.log("   - No one has completed a Stripe checkout yet");
      console.log("   - Webhook failed to update user records");
      console.log("   - Database connection issues");
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Unknown'} (${user.email})`);
        console.log(`   Credits: ${user.credits}`);
        console.log(`   Stripe Customer ID: ${user.stripeCustomerId || 'None'}`);
        console.log(`   Stripe Subscription ID: ${user.stripeSubscriptionId || 'None'}`);
        console.log(`   Stripe Price ID: ${user.stripePriceId || 'None'}`);
        console.log(`   Last Updated: ${user.updatedAt}`);
        console.log("");
      });
    }

    // Check recent webhook events (if any)
    console.log("🌐 Recent Activity Check:");
    console.log("   Check your server logs for webhook events");
    console.log("   Look for lines starting with '🔄 Processing checkout.session.completed'");
    console.log("   Or '❌ Error updating user:' for failures");

  } catch (error) {
    console.error("❌ Database connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

quickCheck()
  .then(() => {
    console.log("\n✅ Quick check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Quick check failed:", error);
    process.exit(1);
  }); 