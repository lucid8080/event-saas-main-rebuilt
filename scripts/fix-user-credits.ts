#!/usr/bin/env tsx

import { prisma } from '@/lib/db';
import { pricingData } from '@/config/subscriptions';

async function fixUserCredits() {
  console.log("🔧 Fixing User Credits");
  console.log("=====================\n");

  const userEmail = "thinkbiglifestyle365@gmail.com";

  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true
      }
    });

    if (!user) {
      console.log(`❌ User not found: ${userEmail}`);
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);
    console.log(`   Current credits: ${user.credits}`);
    console.log(`   Stripe data: ${user.stripeCustomerId ? 'Present' : 'None'}`);

    // Check what plan they should have (assuming Pro plan)
    const proPlan = pricingData.find(plan => plan.title === "Pro");
    
    if (!proPlan) {
      console.log("❌ Pro plan not found in configuration");
      return;
    }

    console.log(`📦 Pro plan credits: ${proPlan.credits.monthly} (monthly) / ${proPlan.credits.yearly} (yearly)`);

    // Option 1: Manual credit assignment (temporary fix)
    console.log("\n🔧 Option 1: Manual Credit Assignment");
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        credits: proPlan.credits.monthly, // Using monthly credits as default
        stripePriceId: proPlan.stripeIds.monthly // Assuming monthly Pro plan
      }
    });

    console.log(`✅ Credits updated: ${updatedUser.credits}`);
    console.log(`   Price ID set: ${updatedUser.stripePriceId}`);

    // Option 2: Test webhook functionality
    console.log("\n🌐 Option 2: Test Webhook Functionality");
    console.log("   You can now test the webhook by:");
    console.log("   1. Going to /dashboard/debug");
    console.log("   2. Clicking 'Test Credit Assignment'");
    console.log("   3. Entering a price ID to simulate checkout");

    // Show available price IDs
    console.log("\n📋 Available Price IDs for testing:");
    pricingData.forEach(plan => {
      console.log(`   ${plan.title}:`);
      console.log(`     Monthly: ${plan.stripeIds.monthly || 'Not set'}`);
      console.log(`     Yearly: ${plan.stripeIds.yearly || 'Not set'}`);
      console.log(`     Credits: ${plan.credits.monthly} (monthly) / ${plan.credits.yearly} (yearly)`);
    });

  } catch (error) {
    console.error("❌ Error fixing user credits:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserCredits()
  .then(() => {
    console.log("\n✅ Credit fix completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Credit fix failed:", error);
    process.exit(1);
  }); 