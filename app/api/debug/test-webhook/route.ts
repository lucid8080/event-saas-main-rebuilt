import { prisma } from "@/lib/db";
import { pricingData } from "@/config/subscriptions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    console.log("🧪 Test webhook received:", body);

    // Simulate a checkout.session.completed event
    if (body.testType === "checkout.session.completed") {
      const { userId, priceId } = body;
      
      if (!userId || !priceId) {
        return Response.json({ 
          error: "Missing userId or priceId" 
        }, { status: 400 });
      }

      // Find the plan based on the price ID
      const plan = pricingData.find(
        (plan) => 
          plan.stripeIds.monthly === priceId || 
          plan.stripeIds.yearly === priceId
      );

      console.log("📦 Found plan:", plan?.title);
      // Determine if this is a yearly or monthly subscription
    const isYearly = plan?.stripeIds.yearly === priceId;
    const creditAmount = isYearly ? plan?.credits.yearly : plan?.credits.monthly;
    console.log("🎫 Credits to assign:", creditAmount);

      if (!plan) {
        return Response.json({ 
          error: "Plan not found for price ID", 
          priceId 
        }, { status: 400 });
      }

      // Update the user with credits
      try {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            credits: creditAmount,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          },
        });

        console.log("✅ User updated successfully:", updatedUser.id);
        console.log("🎫 Credits assigned:", updatedUser.credits);

        return Response.json({
          success: true,
          user: {
            id: updatedUser.id,
            credits: updatedUser.credits,
            plan: plan.title
          }
        });

      } catch (error) {
        console.error("❌ Error updating user:", error);
        return Response.json({ 
          error: "Failed to update user", 
          details: error.message 
        }, { status: 500 });
      }
    }

    // Test webhook endpoint accessibility
    if (body.testType === "ping") {
      return Response.json({
        success: true,
        message: "Webhook endpoint is accessible",
        timestamp: new Date().toISOString()
      });
    }

    return Response.json({ 
      error: "Invalid test type. Use 'ping' or 'checkout.session.completed'" 
    }, { status: 400 });

  } catch (error) {
    console.error("Test webhook error:", error);
    return Response.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 });
  }
} 