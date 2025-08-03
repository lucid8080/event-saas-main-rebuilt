import { pricingData } from "@/config/subscriptions";

export async function GET() {
  try {
    const testResults = [];

    // Test both yearly and monthly for each plan
    for (const plan of pricingData) {
      const planResult = {
        plan: plan.title,
        monthly: {
          priceId: plan.stripeIds.monthly,
          amount: plan.prices.monthly,
          credits: plan.credits.monthly
        },
        yearly: {
          priceId: plan.stripeIds.yearly,
          amount: plan.prices.yearly,
          credits: plan.credits.yearly
        }
      };

      testResults.push(planResult);
    }

    return Response.json({
      testResults,
      summary: {
        totalPlans: pricingData.length,
        monthlyDefault: true,
        yearlyDiscount: "20% off",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Pricing logic test error:", error);
    return Response.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
} 