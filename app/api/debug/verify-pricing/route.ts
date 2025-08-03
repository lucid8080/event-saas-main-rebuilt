import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { pricingData } from "@/config/subscriptions";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check if Stripe API key is configured
    if (!process.env.STRIPE_API_KEY) {
      return Response.json({
        error: "Stripe API key not configured",
        recommendations: [
          {
            type: 'critical',
            message: 'Stripe API key is missing',
            action: 'Add STRIPE_API_KEY to your environment variables'
          }
        ]
      });
    }

    const verificationResults = [];

    // Verify each plan's pricing
    for (const plan of pricingData) {
      const planResult = {
        plan: plan.title,
        expected: {
          monthly: plan.prices.monthly,
          yearly: plan.prices.yearly,
          credits: {
            monthly: plan.credits.monthly,
            yearly: plan.credits.yearly
          }
        },
        stripe: {
          monthly: null,
          yearly: null,
          errors: []
        }
      };

      // Check monthly price
      if (plan.stripeIds.monthly) {
        try {
          const monthlyPrice = await stripe.prices.retrieve(plan.stripeIds.monthly);
          planResult.stripe.monthly = {
            id: monthlyPrice.id,
            amount: monthlyPrice.unit_amount / 100, // Convert from cents
            currency: monthlyPrice.currency,
            recurring: monthlyPrice.recurring
          };

          // Verify amount matches
          if (monthlyPrice.unit_amount / 100 !== plan.prices.monthly) {
            planResult.stripe.errors.push(
              `Monthly price mismatch: Stripe shows $${monthlyPrice.unit_amount / 100}, expected $${plan.prices.monthly}`
            );
          }

          // Verify billing period
          if (monthlyPrice.recurring?.interval !== 'month') {
            planResult.stripe.errors.push(
              `Monthly price billing period is ${monthlyPrice.recurring?.interval}, expected 'month'`
            );
          }
        } catch (error) {
          planResult.stripe.errors.push(`Failed to retrieve monthly price: ${error.message}`);
        }
      } else {
        planResult.stripe.errors.push('Monthly price ID not configured');
      }

      // Check yearly price
      if (plan.stripeIds.yearly) {
        try {
          const yearlyPrice = await stripe.prices.retrieve(plan.stripeIds.yearly);
          planResult.stripe.yearly = {
            id: yearlyPrice.id,
            amount: yearlyPrice.unit_amount / 100, // Convert from cents
            currency: yearlyPrice.currency,
            recurring: yearlyPrice.recurring
          };

          // Verify amount matches
          if (yearlyPrice.unit_amount / 100 !== plan.prices.yearly) {
            planResult.stripe.errors.push(
              `Yearly price mismatch: Stripe shows $${yearlyPrice.unit_amount / 100}, expected $${plan.prices.yearly}`
            );
          }

          // Verify billing period
          if (yearlyPrice.recurring?.interval !== 'year') {
            planResult.stripe.errors.push(
              `Yearly price billing period is ${yearlyPrice.recurring?.interval}, expected 'year'`
            );
          }
        } catch (error) {
          planResult.stripe.errors.push(`Failed to retrieve yearly price: ${error.message}`);
        }
      } else {
        planResult.stripe.errors.push('Yearly price ID not configured');
      }

      verificationResults.push(planResult);
    }

    // Generate recommendations
    const recommendations = [];
    const allErrors = verificationResults.flatMap(result => result.stripe.errors);

    if (allErrors.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `${allErrors.length} pricing issues found`,
        action: 'Update Stripe prices to match application configuration'
      });
    } else {
      recommendations.push({
        type: 'success',
        message: 'All pricing configurations match correctly',
        action: 'No action needed'
      });
    }

    return Response.json({
      verificationResults,
      recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Pricing verification error:", error);
    return Response.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
} 