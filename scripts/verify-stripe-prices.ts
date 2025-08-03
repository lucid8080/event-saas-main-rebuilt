import { stripe } from "@/lib/stripe";
import { pricingData } from "@/config/subscriptions";
import { env } from "@/env.mjs";

async function verifyStripePrices() {
  console.log("🔍 Verifying Stripe Price IDs...\n");

  const expectedPrices = {
    starter: {
      monthly: 3000, // $30.00 in cents
      yearly: 28800, // $288.00 in cents
    },
    pro: {
      monthly: 6000, // $60.00 in cents
      yearly: 57600, // $576.00 in cents
    },
    business: {
      monthly: 12000, // $120.00 in cents
      yearly: 115200, // $1152.00 in cents
    },
  };

  for (const plan of pricingData) {
    const planKey = plan.title.toLowerCase();
    console.log(`📋 ${plan.title.toUpperCase()} PLAN:`);
    
    // Check monthly price
    if (plan.stripeIds.monthly) {
      try {
        const monthlyPrice = await stripe.prices.retrieve(plan.stripeIds.monthly);
        const monthlyAmount = monthlyPrice.unit_amount || 0;
        const expectedMonthly = expectedPrices[planKey as keyof typeof expectedPrices]?.monthly;
        
        console.log(`  Monthly: ${plan.stripeIds.monthly}`);
        console.log(`    Expected: $${expectedMonthly / 100}`);
        console.log(`    Actual: $${monthlyAmount / 100}`);
        console.log(`    Status: ${monthlyAmount === expectedMonthly ? "✅ Match" : "❌ Mismatch"}`);
      } catch (error) {
        console.log(`  Monthly: ${plan.stripeIds.monthly} - ❌ Invalid Price ID`);
      }
    } else {
      console.log(`  Monthly: ❌ Missing Price ID`);
    }

    // Check yearly price
    if (plan.stripeIds.yearly) {
      try {
        const yearlyPrice = await stripe.prices.retrieve(plan.stripeIds.yearly);
        const yearlyAmount = yearlyPrice.unit_amount || 0;
        const expectedYearly = expectedPrices[planKey as keyof typeof expectedPrices]?.yearly;
        
        console.log(`  Yearly: ${plan.stripeIds.yearly}`);
        console.log(`    Expected: $${expectedYearly / 100}`);
        console.log(`    Actual: $${yearlyAmount / 100}`);
        console.log(`    Status: ${yearlyAmount === expectedYearly ? "✅ Match" : "❌ Mismatch"}`);
      } catch (error) {
        console.log(`  Yearly: ${plan.stripeIds.yearly} - ❌ Invalid Price ID`);
      }
    } else {
      console.log(`  Yearly: ❌ Missing Price ID`);
    }
    
    console.log("");
  }

  console.log("💡 To fix mismatches:");
  console.log("1. Go to Stripe Dashboard → Products");
  console.log("2. Create/update products with correct prices");
  console.log("3. Copy the new price IDs to your .env file");
  console.log("4. Restart your development server");
}

verifyStripePrices()
  .catch(console.error)
  .finally(() => process.exit(0)); 