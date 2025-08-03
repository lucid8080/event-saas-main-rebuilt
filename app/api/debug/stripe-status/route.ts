import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { stripe } from "@/lib/stripe";
import { pricingData } from "@/config/subscriptions";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Get subscription plan info
    const subscriptionPlan = await getUserSubscriptionPlan(userId);

    // Check environment variables
    const envCheck = {
      stripeApiKey: {
        exists: !!process.env.STRIPE_API_KEY,
        length: process.env.STRIPE_API_KEY?.length || 0,
        prefix: process.env.STRIPE_API_KEY?.substring(0, 7) || 'N/A'
      },
      stripeWebhookSecret: {
        exists: !!process.env.STRIPE_WEBHOOK_SECRET,
        length: process.env.STRIPE_WEBHOOK_SECRET?.length || 0,
        prefix: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 5) || 'N/A'
      },
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    };

    // Check configured plan IDs
    const planIds = pricingData.map(plan => ({
      title: plan.title,
      monthly: {
        id: plan.stripeIds.monthly || 'Not set',
        exists: !!plan.stripeIds.monthly,
        valid: plan.stripeIds.monthly?.startsWith('price_') || false
      },
      yearly: {
        id: plan.stripeIds.yearly || 'Not set',
        exists: !!plan.stripeIds.yearly,
        valid: plan.stripeIds.yearly?.startsWith('price_') || false
      },
      credits: plan.credits
    }));

    // Test Stripe API connectivity
    let stripeTest = { success: false, error: null };
    try {
      if (process.env.STRIPE_API_KEY) {
        const testCustomer = await stripe.customers.list({ limit: 1 });
        stripeTest = { success: true, error: null };
      } else {
        stripeTest = { success: false, error: 'No Stripe API key configured' };
      }
    } catch (error) {
      stripeTest = { success: false, error: error.message };
    }

    // Check if user's price ID matches any configured plan
    let planMatch = null;
    if (user.stripePriceId) {
      planMatch = pricingData.find(
        (plan) => 
          plan.stripeIds.monthly === user.stripePriceId || 
          plan.stripeIds.yearly === user.stripePriceId
      );
    }

    // Check subscription status in Stripe
    let stripeSubscription = null;
    if (user.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      } catch (error) {
        stripeSubscription = { error: error.message };
      }
    }

    return Response.json({
      user,
      subscriptionPlan,
      planMatch,
      stripeSubscription,
      envCheck,
      planIds,
      stripeTest,
      timestamp: new Date().toISOString(),
      recommendations: generateRecommendations({
        user,
        subscriptionPlan,
        envCheck,
        planIds,
        stripeTest,
        planMatch
      })
    });

  } catch (error) {
    console.error("Stripe status API error:", error);
    return Response.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
}

function generateRecommendations(data: any) {
  const recommendations = [];

  // Check environment variables
  if (!data.envCheck.stripeApiKey.exists) {
    recommendations.push({
      type: 'critical',
      message: 'Stripe API key is missing. Add STRIPE_API_KEY to your environment variables.',
      action: 'Set up Stripe API key in .env.local'
    });
  }

  if (!data.envCheck.stripeWebhookSecret.exists) {
    recommendations.push({
      type: 'critical',
      message: 'Stripe webhook secret is missing. Add STRIPE_WEBHOOK_SECRET to your environment variables.',
      action: 'Set up webhook secret in .env.local'
    });
  }

  // Check plan IDs
  const invalidPlans = data.planIds.filter(plan => 
    !plan.monthly.valid || !plan.yearly.valid
  );
  
  if (invalidPlans.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `Invalid price IDs found for plans: ${invalidPlans.map(p => p.title).join(', ')}`,
      action: 'Update price IDs in environment variables'
    });
  }

  // Check Stripe connectivity
  if (!data.stripeTest.success) {
    recommendations.push({
      type: 'critical',
      message: `Stripe API connectivity failed: ${data.stripeTest.error}`,
      action: 'Check Stripe API key and network connectivity'
    });
  }

  // Check user subscription status
  if (data.user.credits === 0 && !data.user.stripeCustomerId) {
    recommendations.push({
      type: 'info',
      message: 'User has no credits and no Stripe subscription. This is normal for new users.',
      action: 'Complete a plan upgrade to get credits'
    });
  }

  if (data.user.stripePriceId && !data.planMatch) {
    recommendations.push({
      type: 'warning',
      message: 'User has a Stripe price ID but it doesn\'t match any configured plan.',
      action: 'Check if price IDs are correctly configured'
    });
  }

  return recommendations;
} 