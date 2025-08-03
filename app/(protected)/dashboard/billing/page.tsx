import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { BillingInfo } from "@/components/pricing/billing-info";

export const metadata = constructMetadata({
  title: "Billing – EventCraftAI",
  description: "Manage billing and your subscription plan.",
});

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BillingPage() {
  const user = await getCurrentUser();

  // Check if user exists and is authenticated
  if (!user || !user.id) {
    redirect("/login");
  }

  // Check if user exists in database
  const { prisma } = await import("@/lib/db");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true }
  });

  if (!dbUser) {
    console.log("User not found in database, redirecting to login");
    redirect("/login");
  }

  let userSubscriptionPlan;
  try {
    userSubscriptionPlan = await getUserSubscriptionPlan(user.id);
  } catch (error) {
    console.error("Error getting user subscription plan:", error);
    // Fallback to default plan if there's an error
    const { pricingData } = await import("@/config/subscriptions");
    const defaultPlan = pricingData[0];
    userSubscriptionPlan = {
      ...defaultPlan,
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

  return (
    <>
      <DashboardHeader
        heading="Billing"
        text="Manage billing and your subscription plan."
      />
      <div className="grid gap-8">
        <BillingInfo userSubscriptionPlan={userSubscriptionPlan} />
      </div>
    </>
  );
}
