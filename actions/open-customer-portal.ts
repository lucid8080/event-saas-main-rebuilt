"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export type responseAction = {
  status: "success" | "error";
  stripeUrl?: string;
};

const billingUrl = absoluteUrl("/dashboard/billing");

export async function openCustomerPortal(
  userStripeId: string,
): Promise<responseAction> {
  let redirectUrl: string = "";

  try {
    if (!userStripeId) {
      throw new Error("No Stripe customer ID provided");
    }

    const session = await auth();

    if (!session?.user || !session?.user.email) {
      throw new Error("User not authenticated");
    }

    try {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userStripeId,
        return_url: billingUrl,
      });

      if (!stripeSession?.url) {
        throw new Error("Failed to create Stripe portal session");
      }

      redirectUrl = stripeSession.url;
    } catch (stripeError: any) {
      console.error("Stripe error:", stripeError);
      throw new Error(stripeError?.message || "Error creating Stripe portal session");
    }

  } catch (error: any) {
    console.error("Portal error:", error);
    throw new Error(error?.message || "Failed to generate user stripe session");
  }

  if (!redirectUrl) {
    throw new Error("No redirect URL generated");
  }

  redirect(redirectUrl);
}
