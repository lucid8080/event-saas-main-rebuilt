"use client";

import { useTransition } from "react";
import { generateUserStripe } from "@/actions/generate-user-stripe";
import { SubscriptionPlan, UserSubscriptionPlan } from "@/types";
import { getPlanActionText, getPlanChangeDescription, isUpgrade, isDowngrade, isSamePlan } from "@/lib/plan-utils";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/shared/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BillingFormButtonProps {
  offer: SubscriptionPlan;
  subscriptionPlan: UserSubscriptionPlan;
  year: boolean;
}

export function BillingFormButton({
  year,
  offer,
  subscriptionPlan,
}: BillingFormButtonProps) {
  let [isPending, startTransition] = useTransition();
  
  // Get the correct price ID based on yearly/monthly selection
  const selectedPriceId = offer.stripeIds[year ? "yearly" : "monthly"];
  const billingType = year ? "yearly" : "monthly";
  
  // Debug logging
  console.log(`BillingFormButton - Plan: ${offer.title}, Billing: ${billingType}, Price ID: ${selectedPriceId}`);
  
  const generateUserStripeSession = generateUserStripe.bind(
    null,
    selectedPriceId,
  );

  const stripeSessionAction = () =>
    startTransition(async () => await generateUserStripeSession());

  // Smart plan switching logic
  const actionText = getPlanActionText(subscriptionPlan, offer.title, year);
  const changeDescription = getPlanChangeDescription(subscriptionPlan, offer.title, year);
  
  // Determine if this is the user's current plan
  const isCurrentPlan = subscriptionPlan.stripePriceId === selectedPriceId;
  
  // Determine button variant based on action type
  let buttonVariant: "default" | "outline" | "destructive" = "outline";
  if (isCurrentPlan) {
    buttonVariant = "default";
  } else if (isDowngrade(subscriptionPlan.title, offer.title)) {
    buttonVariant = "destructive";
  } else if (isUpgrade(subscriptionPlan.title, offer.title)) {
    buttonVariant = "default";
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={buttonVariant}
            rounded="full"
            className="w-full"
            disabled={isPending}
            onClick={stripeSessionAction}
          >
            {isPending ? (
              <>
                <Icons.spinner className="size-4 mr-2 animate-spin" /> Loading...
              </>
            ) : (
              <>{actionText}</>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{changeDescription}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
