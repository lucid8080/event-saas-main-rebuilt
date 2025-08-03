import Link from "next/link";
import * as React from "react";

import { CustomerPortalButton } from "@/components/forms/customer-portal-button";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { UserSubscriptionPlan } from "types";

interface BillingInfoProps extends React.HTMLAttributes<HTMLFormElement> {
  userSubscriptionPlan: UserSubscriptionPlan;
}

export function BillingInfo({ userSubscriptionPlan }: BillingInfoProps) {
  const {
    title,
    description,
    stripeCustomerId,
    isPaid,
    isCanceled,
    stripeCurrentPeriodEnd,
    balance,
    userCredits,
    credits,
    interval,
  } = userSubscriptionPlan;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>
          You are currently on the <strong>{title}</strong> plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>{description}</p>
          
          {/* Current Credit Balance - Always show */}
          <div className="p-4 bg-gradient-to-r rounded-lg dark:from-purple-950/20 dark:to-blue-950/20 border from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground font-medium">Current Credit Balance</span>
                <div className="text-2xl text-purple-600 dark:text-purple-400 font-bold">
                  {userCredits} credits
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Available</span>
              </div>
            </div>
          </div>
          
          {isPaid && (
            <div className="p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan Credits</span>
                <span className="text-sm text-muted-foreground font-medium">
                  {interval === 'year' ? credits.yearly : credits.monthly} credits per billing cycle
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col py-2 space-y-2 bg-accent border-t md:flex-row md:justify-between md:space-y-0 items-center">
        {isPaid ? (
          <p className="text-sm text-muted-foreground font-medium">
            {isCanceled
              ? "Your plan will be canceled on "
              : "Your plan renews on "}
            {formatDate(stripeCurrentPeriodEnd ?? 0)}.
          </p>
        ) : null}

        {isPaid && stripeCustomerId ? (
          <CustomerPortalButton userStripeId={stripeCustomerId} />
        ) : (
          <Link href="/pricing" className={cn(buttonVariants())}>
            Choose a plan
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
