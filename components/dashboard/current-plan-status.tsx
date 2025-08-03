"use client";

import { UserSubscriptionPlan } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";
import { format } from "date-fns";

interface CurrentPlanStatusProps {
  subscriptionPlan: UserSubscriptionPlan;
}

export function CurrentPlanStatus({ subscriptionPlan }: CurrentPlanStatusProps) {
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp), "MMM dd, yyyy");
  };

  const getPlanColor = (planTitle: string) => {
    switch (planTitle.toLowerCase()) {
      case "starter":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pro":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "business":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "no plan":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = () => {
    if (!subscriptionPlan.isPaid) {
      return <Icons.user className="size-4" />;
    }
    if (subscriptionPlan.isCanceled) {
      return <Icons.close className="size-4" />;
    }
    return <Icons.check className="size-4" />;
  };

  const getStatusText = () => {
    if (!subscriptionPlan.isPaid) {
      return "No Plan";
    }
    if (subscriptionPlan.isCanceled) {
      return "Canceling";
    }
    return "Active";
  };

  const getStatusColor = () => {
    if (!subscriptionPlan.isPaid) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
    if (subscriptionPlan.isCanceled) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.billing className="size-5" />
          Current Plan Status
        </CardTitle>
        <CardDescription>
          Your subscription details and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getPlanColor(subscriptionPlan.title)}>
              {subscriptionPlan.title}
            </Badge>
            <Badge className={getStatusColor()}>
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Credits</div>
            <div className="text-lg font-semibold">{subscriptionPlan.userCredits}</div>
          </div>
        </div>

        {subscriptionPlan.isPaid && (
          <>
            <div className="grid grid-cols-2 text-sm gap-4">
              <div>
                <div className="text-muted-foreground">Billing Cycle</div>
                <div className="font-medium capitalize">
                  {subscriptionPlan.interval || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Credits per Cycle</div>
                <div className="font-medium">
                  {subscriptionPlan.interval === 'year' 
                    ? subscriptionPlan.credits.yearly 
                    : subscriptionPlan.credits.monthly}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 text-sm gap-4">
              <div>
                <div className="text-muted-foreground">Next Billing Date</div>
                <div className="font-medium">
                  {formatDate(subscriptionPlan.stripeCurrentPeriodEnd)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Account Balance</div>
                <div className="font-medium">
                  ${subscriptionPlan.balance?.toFixed(2) || "0.00"}
                </div>
              </div>
            </div>

            {subscriptionPlan.isCanceled && (
              <div className="p-3 bg-yellow-50 rounded-lg dark:bg-yellow-950/20">
                <div className="flex text-sm text-yellow-800 dark:text-yellow-200 items-center gap-2">
                  <Icons.warning className="size-4" />
                  <span>
                    Your subscription will end on{" "}
                    {formatDate(subscriptionPlan.stripeCurrentPeriodEnd)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {!subscriptionPlan.isPaid && (
          <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-950/20">
            <div className="flex text-sm text-blue-800 dark:text-blue-200 items-center gap-2">
              <Icons.help className="size-4" />
              <span>
                Choose a plan to start generating images with credits
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 