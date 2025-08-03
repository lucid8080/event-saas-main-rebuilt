import { prisma } from "@/lib/db";
import { recordImageGeneration } from "@/lib/statistics";

export async function trackImageGeneration(
  userId: string,
  eventType?: string,
  style?: string
) {
  try {
    // Record in the statistics system
    await recordImageGeneration(userId, eventType, style);
    
    // Also record user activity
    await prisma.userActivity.create({
      data: {
        userId,
        action: "image_generated",
        metadata: {
          eventType,
          style,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error tracking image generation:", error);
    // Don't throw error to avoid breaking the main flow
  }
}

export async function trackUserLogin(userId: string) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        action: "user_login",
        metadata: {
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error tracking user login:", error);
  }
}

export async function trackUserRegistration(userId: string) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        action: "user_registration",
        metadata: {
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error tracking user registration:", error);
  }
} 