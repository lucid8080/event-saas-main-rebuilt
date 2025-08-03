import { headers } from "next/headers";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { pricingData } from "@/config/subscriptions";

export async function POST(req: Request) {
  console.log("Webhook received");

  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    console.log("🔄 Processing checkout.session.completed event");
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("📋 Session metadata:", session.metadata);
    console.log("👤 User ID from metadata:", session?.metadata?.userId);

    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    console.log("💳 Subscription ID:", subscription.id);
    console.log("💰 Price ID:", subscription.items.data[0].price.id);

    // Find the plan based on the price ID to get the credit amount
    const priceId = subscription.items.data[0].price.id;
    const plan = pricingData.find(
      (plan) => 
        plan.stripeIds.monthly === priceId || 
        plan.stripeIds.yearly === priceId
    );

    // Determine if this is a yearly or monthly subscription
    const isYearly = plan?.stripeIds.yearly === priceId;
    const creditAmount = isYearly ? plan?.credits.yearly : plan?.credits.monthly;

    console.log("📦 Found plan:", plan?.title);
    console.log("🔄 Billing cycle:", isYearly ? "Yearly" : "Monthly");
    console.log("🎫 Credits to assign:", creditAmount);

    // Update the user stripe info in our database.
    // Since this is the initial subscription, we need to update
    // the subscription id and customer id, and set initial credits.
    try {
      const updatedUser = await prisma.user.update({
        where: {
          id: session?.metadata?.userId,
        },
        data: {
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
          credits: creditAmount || 0, // Set initial credits based on the billing cycle
        },
      });

      console.log("✅ User updated successfully:", updatedUser.id);
      console.log("🎫 Credits assigned:", updatedUser.credits);
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    console.log("🔄 Processing invoice.payment_succeeded event");
    const session = event.data.object as Stripe.Invoice;

    // If the billing reason is not subscription_create, it means the customer has updated their subscription.
    // If it is subscription_create, we don't need to update the subscription id and it will handle by the checkout.session.completed event.
    if (session.billing_reason != "subscription_create") {
      console.log("💳 Processing subscription renewal");
      
      // Retrieve the subscription details from Stripe.
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      // Find the plan based on the price ID to get the credit amount
      const priceId = subscription.items.data[0].price.id;
      const plan = pricingData.find(
        (plan) => 
          plan.stripeIds.monthly === priceId || 
          plan.stripeIds.yearly === priceId
      );

      // Determine if this is a yearly or monthly subscription
      const isYearly = plan?.stripeIds.yearly === priceId;
      const creditAmount = isYearly ? plan?.credits.yearly : plan?.credits.monthly;

      console.log("📦 Found plan for renewal:", plan?.title);
      console.log("🔄 Billing cycle:", isYearly ? "Yearly" : "Monthly");
      console.log("🎫 Credits to refresh:", creditAmount);

      // Update the price id, set the new period end, and refresh credits.
      try {
        const updatedUser = await prisma.user.update({
          where: {
            stripeSubscriptionId: subscription.id,
          },
          data: {
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000,
            ),
            credits: creditAmount || 0, // Refresh credits on renewal based on billing cycle
          },
        });

        console.log("✅ User credits refreshed successfully:", updatedUser.id);
        console.log("🎫 Credits refreshed to:", updatedUser.credits);
      } catch (error) {
        console.error("❌ Error refreshing user credits:", error);
        throw error;
      }
    }
  }

  return new Response(null, { status: 200 });
}
