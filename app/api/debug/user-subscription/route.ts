import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserSubscriptionPlan } from "@/lib/subscription";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get raw user data
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        stripeCustomerId: true,
        stripePriceId: true,
        credits: true,
      },
    });

    // Get processed subscription plan
    const subscriptionPlan = await getUserSubscriptionPlan(userId);

    // Debug calculations
    const currentTime = Date.now();
    const periodEndTime = user?.stripeCurrentPeriodEnd?.getTime() || 0;
    const timeRemaining = periodEndTime - currentTime;
    const oneDayInMs = 86_400_000;

    const debugInfo = {
      userId,
      rawUserData: user,
      processedSubscriptionPlan: subscriptionPlan,
      debugCalculations: {
        currentTime,
        periodEndTime,
        timeRemaining,
        oneDayInMs,
        periodEndPlusOneDay: periodEndTime + oneDayInMs,
        isPeriodValid: periodEndTime + oneDayInMs > currentTime,
        hasSubscriptionId: !!user?.stripeSubscriptionId,
        hasPriceId: !!user?.stripePriceId,
        isPaidCalculation: user?.stripePriceId && 
          (periodEndTime + oneDayInMs > currentTime || 
           (user?.stripeSubscriptionId && user?.stripePriceId))
      }
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error("Error in user subscription debug:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
} 