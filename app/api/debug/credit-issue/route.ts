import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { pricingData } from "@/config/subscriptions";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        credits: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check environment variables
    const envCheck = {
      STRIPE_API_KEY: !!process.env.STRIPE_API_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID: !!process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID,
      NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID: !!process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID,
      NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: !!process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
      NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: !!process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
      NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: !!process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
      NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: !!process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
    };

    // Check if user has any Stripe subscription data
    const hasStripeData = !!(user.stripeSubscriptionId || user.stripeCustomerId || user.stripePriceId);

    // Find matching plan based on current price ID
    let currentPlan = null;
    if (user.stripePriceId) {
      currentPlan = pricingData.find(
        (plan) => 
          plan.stripeIds.monthly === user.stripePriceId || 
          plan.stripeIds.yearly === user.stripePriceId
      );
    }

    // Check if credits match expected amount for current plan
    let creditMismatch = null;
    if (currentPlan && user.stripePriceId) {
      const isYearly = currentPlan.stripeIds.yearly === user.stripePriceId;
      const expectedCredits = isYearly ? currentPlan.credits.yearly : currentPlan.credits.monthly;
      
      if (user.credits !== expectedCredits) {
        creditMismatch = {
          current: user.credits,
          expected: expectedCredits,
          plan: currentPlan.title,
          billingCycle: isYearly ? 'yearly' : 'monthly'
        };
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        stripeSubscriptionId: user.stripeSubscriptionId,
        stripeCustomerId: user.stripeCustomerId,
        stripePriceId: user.stripePriceId,
        stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      diagnostics: {
        hasStripeData,
        currentPlan: currentPlan ? {
          title: currentPlan.title,
          priceId: user.stripePriceId,
          isYearly: currentPlan.stripeIds.yearly === user.stripePriceId,
        } : null,
        creditMismatch,
        environmentVariables: envCheck,
      },
      recommendations: {
        ifNoStripeData: "User has no Stripe subscription data. This suggests the webhook never processed or failed.",
        ifCreditMismatch: creditMismatch ? `Credits don't match expected amount. Current: ${creditMismatch.current}, Expected: ${creditMismatch.expected} for ${creditMismatch.plan} ${creditMismatch.billingCycle} plan.` : null,
        ifMissingEnvVars: Object.entries(envCheck).filter(([_, exists]) => !exists).length > 0 ? `Missing environment variables: ${Object.entries(envCheck).filter(([_, exists]) => !exists).map(([key]) => key).join(', ')}` : null,
        nextSteps: [
          "Check Stripe webhook logs for errors",
          "Verify webhook endpoint is accessible",
          "Check if webhook secret is correct",
          "Manually assign credits if needed",
        ]
      }
    });

  } catch (error) {
    console.error("Credit issue diagnostic error:", error);
    return NextResponse.json({ 
      error: "Diagnostic failed", 
      details: error.message 
    }, { status: 500 });
  }
} 