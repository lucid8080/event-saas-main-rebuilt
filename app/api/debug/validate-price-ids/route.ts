import { pricingData } from "@/config/subscriptions";

export async function GET() {
  try {
    const validationResults = [];

    // Check each plan's price IDs
    for (const plan of pricingData) {
      const planResult = {
        plan: plan.title,
        monthly: {
          priceId: plan.stripeIds.monthly,
          isValid: plan.stripeIds.monthly?.startsWith('price_') || false,
          error: null
        },
        yearly: {
          priceId: plan.stripeIds.yearly,
          isValid: plan.stripeIds.yearly?.startsWith('price_') || false,
          error: null
        }
      };

      // Check for common mistakes
      if (plan.stripeIds.monthly?.startsWith('prod_')) {
        planResult.monthly.error = 'This is a Product ID, not a Price ID!';
      } else if (!plan.stripeIds.monthly) {
        planResult.monthly.error = 'Price ID not configured';
      }

      if (plan.stripeIds.yearly?.startsWith('prod_')) {
        planResult.yearly.error = 'This is a Product ID, not a Price ID!';
      } else if (!plan.stripeIds.yearly) {
        planResult.yearly.error = 'Price ID not configured';
      }

      validationResults.push(planResult);
    }

    // Generate recommendations
    const recommendations = [];
    const allErrors = validationResults.flatMap(result => [
      ...(result.monthly.error ? [result.monthly.error] : []),
      ...(result.yearly.error ? [result.yearly.error] : [])
    ]);

    if (allErrors.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `${allErrors.length} price ID issues found`,
        action: 'Fix the price IDs in your environment variables'
      });
    } else {
      recommendations.push({
        type: 'success',
        message: 'All price IDs are valid',
        action: 'No action needed'
      });
    }

    return Response.json({
      validationResults,
      recommendations,
      summary: {
        totalPlans: pricingData.length,
        validPriceIds: validationResults.filter(r => r.monthly.isValid && r.yearly.isValid).length,
        invalidPriceIds: validationResults.filter(r => !r.monthly.isValid || !r.yearly.isValid).length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Price ID validation error:", error);
    return Response.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
} 