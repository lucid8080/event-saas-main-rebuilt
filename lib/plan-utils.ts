import { UserSubscriptionPlan } from "types";

// Plan hierarchy for determining upgrades/downgrades
const PLAN_HIERARCHY = {
  "Starter": 1,
  "Pro": 2,
  "Business": 3
};

export function getPlanLevel(planTitle: string): number {
  return PLAN_HIERARCHY[planTitle as keyof typeof PLAN_HIERARCHY] || 0;
}

export function isUpgrade(currentPlan: string, targetPlan: string): boolean {
  const currentLevel = getPlanLevel(currentPlan);
  const targetLevel = getPlanLevel(targetPlan);
  return targetLevel > currentLevel;
}

export function isDowngrade(currentPlan: string, targetPlan: string): boolean {
  const currentLevel = getPlanLevel(currentPlan);
  const targetLevel = getPlanLevel(targetPlan);
  return targetLevel < currentLevel;
}

export function isSamePlan(currentPlan: string, targetPlan: string): boolean {
  return currentPlan === targetPlan;
}

export function getPlanActionText(
  currentPlan: UserSubscriptionPlan,
  targetPlanTitle: string,
  isYearly: boolean
): string {
  // If user is not on a paid plan, it's always an upgrade
  if (!currentPlan.isPaid) {
    return "Upgrade";
  }

  const currentPlanTitle = currentPlan.title;
  
  if (isSamePlan(currentPlanTitle, targetPlanTitle)) {
    // Same plan, different billing cycle
    const currentInterval = currentPlan.interval;
    const targetInterval = isYearly ? "year" : "month";
    
    if (currentInterval === targetInterval) {
      return "Manage Subscription";
    } else {
      return `Switch to ${isYearly ? "Yearly" : "Monthly"}`;
    }
  } else if (isUpgrade(currentPlanTitle, targetPlanTitle)) {
    return "Upgrade Plan";
  } else if (isDowngrade(currentPlanTitle, targetPlanTitle)) {
    return "Downgrade Plan";
  }
  
  return "Change Plan";
}

export function getPlanChangeDescription(
  currentPlan: UserSubscriptionPlan,
  targetPlanTitle: string,
  isYearly: boolean
): string {
  if (!currentPlan.isPaid) {
    return "Start your subscription";
  }

  const currentPlanTitle = currentPlan.title;
  
  if (isSamePlan(currentPlanTitle, targetPlanTitle)) {
    const currentInterval = currentPlan.interval;
    const targetInterval = isYearly ? "year" : "month";
    
    if (currentInterval === targetInterval) {
      return "Manage your current subscription";
    } else {
      return `Switch billing cycle to ${isYearly ? "yearly" : "monthly"}`;
    }
  } else if (isUpgrade(currentPlanTitle, targetPlanTitle)) {
    return "Upgrade effective immediately";
  } else if (isDowngrade(currentPlanTitle, targetPlanTitle)) {
    return "Downgrade effective next billing cycle";
  }
  
  return "Change plan";
} 