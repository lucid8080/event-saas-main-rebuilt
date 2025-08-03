"use server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { isUpgrade, isDowngrade, isSamePlan } from "@/lib/plan-utils";
import { absoluteUrl } from "@/lib/utils";
import { redirect } from "next/navigation";
import { pricingData } from "@/config/subscriptions";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
}

const billingUrl = absoluteUrl("/dashboard/billing")

export async function generateUserStripe(priceId: string): Promise<responseAction> {
  let redirectUrl: string = "";
  let session: any = null;

  try {
    session = await auth();
    const user = session?.user;

    if (!user || !user.email || !user.id) {
      throw new Error("Unauthorized");
    }

    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

    // Find the target plan based on the price ID
    const targetPlan = pricingData.find(
      (plan) => plan.stripeIds.monthly === priceId || plan.stripeIds.yearly === priceId
    );

    if (!targetPlan) {
      throw new Error(`Invalid price ID: ${priceId}`);
    }

    // Determine if this is the same plan (different billing cycle)
    const isSamePlanDifferentBilling = isSamePlan(subscriptionPlan.title, targetPlan.title) && 
      subscriptionPlan.stripePriceId !== priceId;

    if (subscriptionPlan.isPaid && subscriptionPlan.stripeCustomerId) {
      if (isSamePlanDifferentBilling) {
        // Same plan, different billing cycle - use billing portal
        const stripeSession = await stripe.billingPortal.sessions.create({
          customer: subscriptionPlan.stripeCustomerId,
          return_url: billingUrl,
        });
        redirectUrl = stripeSession.url as string;
      } else if (isUpgrade(subscriptionPlan.title, targetPlan.title)) {
        // Upgrade - create checkout session for immediate upgrade
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: billingUrl,
          cancel_url: billingUrl,
          payment_method_types: ["card"],
          mode: "subscription",
          billing_address_collection: "auto",
          customer: subscriptionPlan.stripeCustomerId,
          line_items: [
            {
              price: priceId,
              quantity: 1,
            },
          ],
          metadata: {
            userId: user.id,
            action: "upgrade",
            fromPlan: subscriptionPlan.title,
            toPlan: targetPlan.title,
          },
        });
        redirectUrl = stripeSession.url as string;
      } else if (isDowngrade(subscriptionPlan.title, targetPlan.title)) {
        // Downgrade - use billing portal for next billing cycle change
        const stripeSession = await stripe.billingPortal.sessions.create({
          customer: subscriptionPlan.stripeCustomerId,
          return_url: billingUrl,
        });
        redirectUrl = stripeSession.url as string;
      } else {
        // Same plan, same billing cycle - use billing portal
        const stripeSession = await stripe.billingPortal.sessions.create({
          customer: subscriptionPlan.stripeCustomerId,
          return_url: billingUrl,
        });
        redirectUrl = stripeSession.url as string;
      }
    } else {
      // User on Free Plan - Create a checkout session to upgrade.
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: billingUrl,
        cancel_url: billingUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        customer_email: user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          action: "new_subscription",
          toPlan: targetPlan.title,
        },
      });
      redirectUrl = stripeSession.url as string;
    }
  } catch (error) {
    // Log the error details
    if (error instanceof Error) {
      console.error("Error generating Stripe session:", error.message);
      console.error("Price ID:", priceId);
      console.error("User ID:", session?.user?.id);
      console.error(error.stack);
      
      // Provide more specific error messages
      if (error.message.includes("No such price")) {
        throw new Error(`Invalid price ID: ${priceId}. Please check your Stripe configuration.`);
      } else if (error.message.includes("Invalid API key")) {
        throw new Error("Invalid Stripe API key. Please check your environment variables.");
      } else if (error.message.includes("Authentication")) {
        throw new Error("Stripe authentication failed. Please check your API key.");
      } else {
        throw new Error(`Stripe error: ${error.message}`);
      }
    } else {
      console.error("Unexpected error:", error);
      throw new Error("Failed to generate user stripe session");
    }
  }

  // no revalidatePath because redirect
  redirect(redirectUrl);
}