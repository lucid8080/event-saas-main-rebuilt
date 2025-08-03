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

    // Check if price ID matches any configured plan
    let planInfo = null;
    if (user.stripePriceId) {
      planInfo = pricingData.find(
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

    // Check environment variables
    const envCheck = {
      stripeApiKey: !!process.env.STRIPE_API_KEY,
      stripeWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set'
    };

    // Check configured plan IDs
    const planIds = pricingData.map(plan => ({
      title: plan.title,
      monthly: plan.stripeIds.monthly || 'Not set',
      yearly: plan.stripeIds.yearly || 'Not set',
      credits: plan.credits
    }));

    return Response.json({
      user,
      subscriptionPlan,
      planInfo,
      stripeSubscription,
      envCheck,
      planIds,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Debug API error:", error);
    return Response.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
} 