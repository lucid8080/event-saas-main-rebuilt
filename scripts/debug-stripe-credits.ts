#!/usr/bin/env tsx

import { prisma } from "@/lib/db";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { stripe } from "@/lib/stripe";
import { pricingData } from "@/config/subscriptions";

async function debugStripeCredits() {
  console.log("🔍 Stripe Credits Debug Script");
  console.log("================================\n");

  try {
    // Get all users with subscription data
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
        createdAt: true,
        updatedAt: true
      }
    });

    console.log(`📊 Found ${users.length} users with subscription data:\n`);

    for (const user of users) {
      console.log(`👤 User: ${user.name || 'Unknown'} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Credits: ${user.credits}`);
      console.log(`   Stripe Customer ID: ${user.stripeCustomerId || 'None'}`);
      console.log(`   Stripe Subscription ID: ${user.stripeSubscriptionId || 'None'}`);
      console.log(`   Stripe Price ID: ${user.stripePriceId || 'None'}`);
      console.log(`   Period End: ${user.stripeCurrentPeriodEnd || 'None'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);

      // Check if price ID matches any configured plan
      if (user.stripePriceId) {
        const plan = pricingData.find(
          (plan) => 
            plan.stripeIds.monthly === user.stripePriceId || 
            plan.stripeIds.yearly === user.stripePriceId
        );
        console.log(`   Expected Credits: ${plan ? `${plan.credits.monthly} (monthly) / ${plan.credits.yearly} (yearly)` : 'Unknown plan'}`);
        console.log(`   Plan: ${plan?.title || 'Unknown'}`);
      }

      // Check subscription status in Stripe
      if (user.stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
          console.log(`   Stripe Status: ${subscription.status}`);
          console.log(`   Stripe Period End: ${new Date(subscription.current_period_end * 1000)}`);
          console.log(`   Stripe Canceled: ${subscription.cancel_at_period_end}`);
        } catch (error) {
          console.log(`   Stripe Error: ${error.message}`);
        }
      }

      console.log("");
    }

    // Test webhook endpoint accessibility
    console.log("🌐 Testing Webhook Endpoint:");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': 'test-signature'
        },
        body: JSON.stringify({ test: true })
      });
      console.log(`   Status: ${response.status}`);
      console.log(`   Accessible: ${response.status !== 404}`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

    // Check environment variables
    console.log("\n🔧 Environment Variables Check:");
    console.log(`   STRIPE_API_KEY: ${process.env.STRIPE_API_KEY ? 'Set' : 'Missing'}`);
    console.log(`   STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Missing'}`);
    console.log(`   NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'Not set'}`);

    // Check configured plan IDs
    console.log("\n📦 Configured Plan IDs:");
    pricingData.forEach(plan => {
      console.log(`   ${plan.title}:`);
      console.log(`     Monthly: ${plan.stripeIds.monthly || 'Not set'}`);
      console.log(`     Yearly: ${plan.stripeIds.yearly || 'Not set'}`);
      console.log(`     Credits: ${plan.credits.monthly} (monthly) / ${plan.credits.yearly} (yearly)`);
    });

  } catch (error) {
    console.error("❌ Error during debug:", error);
  }
}

// Run the debug script
debugStripeCredits()
  .then(() => {
    console.log("\n✅ Debug script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Debug script failed:", error);
    process.exit(1);
  }); 