import Image from "next/image";
import Link from "next/link";

import { getCurrentUser } from "@/lib/session";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { constructMetadata } from "@/lib/utils";
// import { ComparePlans } from "@/components/pricing/compare-plans"; // Commented out
import { PricingCards } from "@/components/pricing/pricing-cards";
import { PricingFaq } from "@/components/pricing/pricing-faq";

export const metadata = constructMetadata({
  title: "Pricing – EventCraftAI",
  description: "Choose the perfect plan for your event image generation needs.",
});

export default async function PricingPage() {
  const user = await getCurrentUser();

  if (user?.role === "ADMIN") {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <h1 className="text-5xl font-bold">Seriously?</h1>
        <Image
          src="/_static/illustrations/call-waiting.svg"
          alt="403"
          width={560}
          height={560}
          className="dark:invert pointer-events-none -my-20"
        />
        <p className="px-4 text-balance text-center text-2xl font-medium">
          You are an {user.role}. Back to{" "}
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-purple-500 underline underline-offset-4"
          >
            Dashboard
          </Link>
          .
        </p>
      </div>
    );
  }

  let subscriptionPlan;
  if (user && user.id) {
    subscriptionPlan = await getUserSubscriptionPlan(user.id);
  }

  return (
    <div className="flex flex-col w-full py-8 md:py-8 gap-16">
      <PricingCards userId={user?.id} subscriptionPlan={subscriptionPlan} />
      <hr className="container" />
      {/* <ComparePlans /> */} {/* Commented out */}
      <PricingFaq />
    </div>
  );
}
