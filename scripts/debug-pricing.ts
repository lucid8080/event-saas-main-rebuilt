import { pricingData } from "@/config/subscriptions";

console.log("🔍 Pricing Configuration Debug\n");

console.log("📋 Current Pricing Configuration:");
pricingData.forEach((plan) => {
  console.log(`\n${plan.title.toUpperCase()}:`);
  console.log(`  Monthly: $${plan.prices.monthly} (ID: ${plan.stripeIds.monthly || 'MISSING'})`);
  console.log(`  Yearly: $${plan.prices.yearly} (ID: ${plan.stripeIds.yearly || 'MISSING'})`);
  console.log(`  Yearly Monthly Equivalent: $${plan.prices.yearly / 12}`);
  console.log(`  Credits: ${plan.credits.monthly} (monthly) / ${plan.credits.yearly} (yearly)`);
});

console.log("\n💡 To debug the pricing mismatch:");
console.log("1. Check your .env file has the correct Stripe price IDs");
console.log("2. Verify the Stripe prices match the configuration above");
console.log("3. Test the checkout process and compare prices");
console.log("\n📝 Expected Stripe Prices:");
console.log("  Starter: $30/month, $288/year");
console.log("  Pro: $60/month, $576/year");
console.log("  Business: $120/month, $1152/year"); 