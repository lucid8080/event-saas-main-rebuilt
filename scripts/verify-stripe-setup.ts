#!/usr/bin/env tsx

import { stripe } from '@/lib/stripe';
import { pricingData } from '@/config/subscriptions';
import { env } from '@/env.mjs';

async function verifyStripeSetup() {
  console.log("🔍 Verifying Stripe Setup");
  console.log("========================\n");

  try {
    // Check environment variables
    console.log("🔧 Environment Variables:");
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

    // Test Stripe API connection
    console.log("\n🌐 Testing Stripe API Connection:");
    try {
      const account = await stripe.accounts.retrieve();
      console.log(`   ✅ Stripe API working`);
      console.log(`   Account: ${account.business_type || 'Unknown'}`);
    } catch (error) {
      console.log(`   ❌ Stripe API error: ${error.message}`);
    }

    // Verify price IDs exist in Stripe
    console.log("\n💰 Verifying Price IDs in Stripe:");
    for (const plan of pricingData) {
      if (plan.stripeIds.monthly) {
        try {
          const price = await stripe.prices.retrieve(plan.stripeIds.monthly);
          console.log(`   ✅ ${plan.title} Monthly: $${(price.unit_amount || 0) / 100}`);
        } catch (error) {
          console.log(`   ❌ ${plan.title} Monthly: Invalid price ID`);
        }
      }
      
      if (plan.stripeIds.yearly) {
        try {
          const price = await stripe.prices.retrieve(plan.stripeIds.yearly);
          console.log(`   ✅ ${plan.title} Yearly: $${(price.unit_amount || 0) / 100}`);
        } catch (error) {
          console.log(`   ❌ ${plan.title} Yearly: Invalid price ID`);
        }
      }
    }

    // Test webhook endpoint
    console.log("\n🌐 Testing Webhook Endpoint:");
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/stripe`;
    console.log(`   Webhook URL: ${webhookUrl}`);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      console.log(`   Status: ${response.status}`);
      console.log(`   Accessible: ${response.status !== 404}`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }

  } catch (error) {
    console.error("❌ Error during verification:", error);
  }
}

verifyStripeSetup()
  .then(() => {
    console.log("\n✅ Stripe setup verification completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Stripe setup verification failed:", error);
    process.exit(1);
  }); 