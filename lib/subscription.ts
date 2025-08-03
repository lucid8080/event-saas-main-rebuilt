// @ts-nocheck
// TODO: Fix this when we turn strict mode on.
import "server-only";
import { pricingData } from "@/config/subscriptions";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { UserSubscriptionPlan } from "types";

export async function getUserSubscriptionPlan(
  userId: string
): Promise<UserSubscriptionPlan> {
  if(!userId) throw new Error("Missing parameters");

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      stripeSubscriptionId: true,
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
      credits: true,
    },
  })



  // If user doesn't exist, return a default unsubscribed state
  if (!user) {
    return {
      title: "No Plan",
      description: "No active subscription",
      benefits: [],
      limitations: [],
      prices: { monthly: 0, yearly: 0 },
      stripeIds: { monthly: null, yearly: null },
      credits: 0,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      balance: 0,
      userCredits: 0,
      isPaid: false,
      interval: null,
      isCanceled: false
    };
  }

  // Add balance fetch
  let balance = 0;
  if (user.stripeCustomerId) {
    try {
      const stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId) as Stripe.Customer;
      balance = (stripeCustomer.balance || 0) / 100; // Convert from cents to dollars
    } catch (error) {
      console.log("⚠️ Stripe customer not found, setting balance to 0:", error.message);
      balance = 0;
    }
  }

  // Check if user is on a paid plan.
  // A user is considered paid if they have a valid price ID and either:
  // 1. Their subscription period hasn't ended yet, OR
  // 2. They have both a subscription ID and price ID (for active subscriptions)
  const currentTime = Date.now();
  const periodEndTime = user.stripeCurrentPeriodEnd?.getTime();
  const hasValidPeriod = periodEndTime && periodEndTime + 86_400_000 > currentTime;
  const hasSubscriptionAndPrice = user.stripeSubscriptionId && user.stripePriceId;
  
  const isPaid = !!(
    user.stripePriceId && (
      hasValidPeriod || hasSubscriptionAndPrice
    )
  );



  // Find the pricing data corresponding to the user's plan
  const userPlan =
    pricingData.find((plan) => plan.stripeIds.monthly === user.stripePriceId) ||
    pricingData.find((plan) => plan.stripeIds.yearly === user.stripePriceId);

  const plan = isPaid && userPlan ? userPlan : {
    title: "No Plan",
    description: "No active subscription",
    benefits: [],
    limitations: [],
    prices: { monthly: 0, yearly: 0 },
    stripeIds: { monthly: null, yearly: null },
    credits: { monthly: 0, yearly: 0 }
  }

  const interval = isPaid
    ? userPlan?.stripeIds.monthly === user.stripePriceId
      ? "month"
      : userPlan?.stripeIds.yearly === user.stripePriceId
      ? "year"
      : null
    : null;

  let isCanceled = false;
  if (isPaid && user.stripeSubscriptionId) {
    try {
      const stripePlan = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      )
      isCanceled = stripePlan.cancel_at_period_end
    } catch (error) {
      console.log("⚠️ Stripe subscription not found, setting isCanceled to false:", error.message);
      isCanceled = false;
    }
  }

  return {
    ...plan,
    ...user,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd?.getTime(),
    balance,
    userCredits: user.credits || 0,
    isPaid,
    interval,
    isCanceled
  };
}


