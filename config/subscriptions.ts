import { PlansRow, SubscriptionPlan } from "types";
import { env } from "@/env.mjs";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "Starter",
    description: "Perfect for getting started",
    benefits: [
      "100 credits",
    ],
    limitations: [],
    prices: {
      monthly: 30,
      yearly: 288,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PLAN_ID,
      yearly: env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PLAN_ID,
    },
    credits: {
      monthly: 100,
      yearly: 1200,
    },
  },
  {
    title: "Pro",
    description: "Best for growing businesses",
    benefits: [
      "200 credits",
    ],
    limitations: [],
    prices: {
      monthly: 60,
      yearly: 576,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
      yearly: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID,
    },
    credits: {
      monthly: 200,
      yearly: 2400,
    },
  },
  {
    title: "Business",
    description: "For larger organizations",
    benefits: [
      "500 credits",
    ],
    limitations: [],
    prices: {
      monthly: 120,
      yearly: 1152,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID,
      yearly: env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID,
    },
    credits: {
      monthly: 500,
      yearly: 6000,
    },
  },
];

export const plansColumns = [
  "starter",
  "pro",
  "business",
] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "Access to Analytics",
    starter: true,
    pro: true,
    business: true,
    enterprise: "Custom",
    tooltip: "All plans include basic analytics for tracking performance.",
  },
  {
    feature: "Custom Branding",
    starter: null,
    pro: "500/mo",
    business: "1,500/mo",
    enterprise: "Unlimited",
    tooltip: "Custom branding is available from the Pro plan onwards.",
  },
  {
    feature: "Priority Support",
    starter: null,
    pro: "Email",
    business: "Email & Chat",
    enterprise: "24/7 Support",
  },
  {
    feature: "Advanced Reporting",
    starter: null,
    pro: null,
    business: true,
    enterprise: "Custom",
    tooltip:
      "Advanced reporting is available in Business and Enterprise plans.",
  },
  {
    feature: "Dedicated Manager",
    starter: null,
    pro: null,
    business: null,
    enterprise: true,
    tooltip: "Enterprise plan includes a dedicated account manager.",
  },
  {
    feature: "API Access",
    starter: "Limited",
    pro: "Standard",
    business: "Enhanced",
    enterprise: "Full",
  },
  {
    feature: "Monthly Webinars",
    starter: false,
    pro: true,
    business: true,
    enterprise: "Custom",
    tooltip: "Pro and higher plans include access to monthly webinars.",
  },
  {
    feature: "Custom Integrations",
    starter: false,
    pro: false,
    business: "Available",
    enterprise: "Available",
    tooltip:
      "Custom integrations are available in Business and Enterprise plans.",
  },
  {
    feature: "Roles and Permissions",
    starter: null,
    pro: "Basic",
    business: "Advanced",
    enterprise: "Advanced",
    tooltip:
      "User roles and permissions management improves with higher plans.",
  },
  {
    feature: "Onboarding Assistance",
    starter: false,
    pro: "Self-service",
    business: "Assisted",
    enterprise: "Full Service",
    tooltip: "Higher plans include more comprehensive onboarding assistance.",
  },
  // Add more rows as needed
];
