"use client";

import { useContext, useState } from "react";
import Link from "next/link";
import { UserSubscriptionPlan } from "@/types";

import { SubscriptionPlan } from "@/types/index";
import { pricingData } from "@/config/subscriptions";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BillingFormButton } from "@/components/forms/billing-form-button";
import { ModalContext } from "@/components/modals/providers";
import { HeaderSection } from "@/components/shared/header-section";
import { Icons } from "@/components/shared/icons";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { CurrentPlanStatus } from "@/components/dashboard/current-plan-status";

interface PricingCardsProps {
  userId?: string;
  subscriptionPlan?: UserSubscriptionPlan;
}

export function PricingCards({ userId, subscriptionPlan }: PricingCardsProps) {
  // Default to monthly (false) instead of yearly (true)
  const isYearlyDefault = subscriptionPlan?.interval === "year" ? true : false;
  const [isYearly, setIsYearly] = useState<boolean>(isYearlyDefault);
  const { setShowSignInModal } = useContext(ModalContext);

  const toggleBilling = (value: string) => {
    const newIsYearly = value === "yearly";
    setIsYearly(newIsYearly);
    console.log(`Pricing toggle changed to: ${value} (isYearly: ${newIsYearly})`);
  };

  const PricingCard = ({ offer }: { offer: SubscriptionPlan }) => {
    // Get the correct credit amount based on billing cycle
    const creditAmount = isYearly ? offer.credits.yearly : offer.credits.monthly;
    
    // Create dynamic benefits list with correct credit amount
    const dynamicBenefits = offer.benefits.map(benefit => 
      benefit.includes("credits") 
        ? `${creditAmount.toLocaleString()} credits`
        : benefit
    );

    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-3xl border shadow-sm w-full max-w-sm mx-auto",
          "min-w-[320px]", // Fixed minimum width
          offer.title.toLocaleLowerCase() === "pro"
            ? "-m-0.5 border-2 border-purple-400"
            : "",
        )}
        key={offer.title}
        style={{ width: '320px' }} // Explicit fixed width
      >
        <div className="min-h-[180px] p-6 space-y-4 bg-muted/50 items-start">
          <p className="flex text-sm text-muted-foreground font-urban font-bold uppercase tracking-wider">
            {offer.title}
          </p>

          <div className="flex flex-row min-h-[60px] items-start w-full">
            <div className="flex items-end w-full">
              <div className="flex text-left text-3xl font-semibold leading-6 flex-wrap">
                {offer.prices.monthly === 0 ? (
                  "Free"
                ) : isYearly && offer.prices.monthly > 0 ? (
                  <>
                    <span className="mr-2 text-muted-foreground/80 line-through whitespace-nowrap">
                      ${offer.prices.monthly}
                    </span>
                    <span className="whitespace-nowrap">${offer.prices.yearly / 12}</span>
                  </>
                ) : (
                  <span className="whitespace-nowrap">${offer.prices.monthly}</span>
                )}
              </div>
              {offer.prices.monthly > 0 && (
                <div className="ml-2 text-left text-sm text-muted-foreground -mb-1 font-medium whitespace-nowrap">
                  <div>/month</div>
                </div>
              )}
            </div>
          </div>
          {offer.prices.monthly > 0 ? (
            <div className="text-left text-sm text-muted-foreground min-h-[40px] flex items-start">
              <span>
                {isYearly
                  ? `$${offer.prices.yearly} will be charged when annual`
                  : "Billed monthly with no commitment"}
              </span>
            </div>
          ) : (
            <div className="text-left text-sm text-muted-foreground min-h-[40px] flex items-start">
              <span>No credit card required</span>
            </div>
          )}
        </div>

        <div className="flex flex-col h-full p-6 justify-between gap-16">
          <ul className="space-y-2 text-left text-sm font-medium leading-normal">
            {dynamicBenefits.map((feature) => (
              <li className="flex items-start gap-x-3" key={feature}>
                <Icons.check className="size-5 text-purple-500 shrink-0" />
                <p>{feature}</p>
              </li>
            ))}

            {offer.limitations.length > 0 &&
              offer.limitations.map((feature) => (
                <li
                  className="flex text-muted-foreground items-start"
                  key={feature}
                >
                  <Icons.close className="size-5 mr-3 shrink-0" />
                  <p>{feature}</p>
                </li>
              ))}
          </ul>

          {userId && subscriptionPlan ? (
            <BillingFormButton
              year={isYearly}
              offer={offer}
              subscriptionPlan={subscriptionPlan}
            />
          ) : (
            <Button
              variant={
                offer.title.toLocaleLowerCase() === "pro"
                  ? "default"
                  : "outline"
              }
              rounded="full"
              onClick={() => setShowSignInModal(true)}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MaxWidthWrapper>
      <section className="flex flex-col text-center items-center">
        <HeaderSection label="Pricing" title="Start at full speed !" />

        {/* Current Plan Status for logged-in users */}
        {userId && subscriptionPlan && (
          <div className="w-full max-w-2xl mb-8">
            <CurrentPlanStatus subscriptionPlan={subscriptionPlan} />
          </div>
        )}

        <div className="flex mt-10 mb-4 items-center gap-5">
          <ToggleGroup
            type="single"
            size="sm"
            value={isYearly ? "yearly" : "monthly"}
            onValueChange={toggleBilling}
            aria-label="toggle-year"
            className="h-9 p-1 bg-background rounded-full overflow-hidden border *:h-7 *:text-muted-foreground"
          >
            <ToggleGroupItem
              value="yearly"
              className="px-5 rounded-full data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
              aria-label="Toggle yearly billing"
            >
              Yearly (-20%)
            </ToggleGroupItem>
            <ToggleGroupItem
              value="monthly"
              className="px-5 rounded-full data-[state=on]:!bg-primary data-[state=on]:!text-primary-foreground"
              aria-label="Toggle monthly billing"
            >
              Monthly
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid py-5 bg-inherit lg:grid-cols-3 gap-5">
          {pricingData.map((offer) => (
            <PricingCard offer={offer} key={offer.title} />
          ))}
        </div>

        <p className="mt-3 text-balance text-center text-base text-muted-foreground">
        Choose from flexible plans that scale with you.
          <br />
          <strong>
          Get the ball rolling with Starter, elevate with Pro, or go Business for maximum impact.
          </strong>
        </p>
      </section>
    </MaxWidthWrapper>
  );
}
