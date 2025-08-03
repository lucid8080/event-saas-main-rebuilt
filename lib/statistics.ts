import { prisma } from "@/lib/db";

export interface DailyStats {
  date: string;
  newUsers: number;
  imagesGenerated: number;
  activeUsers: number;
  revenue: number;
}

export interface ChartStats {
  userActivity: DailyStats[];
  deviceDistribution: { device: string; users: number }[];
  eventTypeDistribution: { eventType: string; count: number }[];
  stylePreferences: { style: string; count: number }[];
  performanceMetrics: { metric: string; value: number }[];
}

export async function recordUserActivity(userId: string, action: string, metadata?: any) {
  try {
    await prisma.userActivity.create({
      data: {
        userId,
        action,
        metadata: metadata || {},
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error recording user activity:", error);
  }
}

export async function recordImageGeneration(userId: string, eventType?: string, style?: string) {
  try {
    await prisma.imageGenerationStats.create({
      data: {
        userId,
        eventType: eventType as any || null, // Cast to EventType enum
        style: style || null,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Error recording image generation:", error);
  }
}

export async function getDailyStats(days: number = 30): Promise<DailyStats[]> {
  const stats: DailyStats[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const [newUsers, imagesGenerated, activeUsers, revenue] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(dateStr + 'T00:00:00Z'),
            lt: new Date(dateStr + 'T23:59:59Z'),
          },
        },
      }),
      prisma.generatedImage.count({
        where: {
          createdAt: {
            gte: new Date(dateStr + 'T00:00:00Z'),
            lt: new Date(dateStr + 'T23:59:59Z'),
          },
        },
      }),
      prisma.user.count({
        where: {
          sessions: {
            some: {
              expires: {
                gt: new Date(dateStr + 'T00:00:00Z'),
              },
            },
          },
        },
      }),
      // Placeholder for revenue calculation
      0,
    ]);

    stats.push({
      date: dateStr,
      newUsers,
      imagesGenerated,
      activeUsers,
      revenue,
    });
  }

  return stats;
}

export async function getDeviceDistribution(): Promise<{ device: string; users: number }[]> {
  // This would typically come from analytics data
  // For now, return empty data to start fresh
  return [];
}

export async function getEventTypeDistribution(): Promise<{ eventType: string; count: number }[]> {
  const stats = await prisma.generatedImage.groupBy({
    by: ['eventType'],
    _count: {
      eventType: true,
    },
    where: {
      eventType: {
        not: null,
      },
    },
  });

  return stats.map(stat => ({
    eventType: stat.eventType!,
    count: stat._count.eventType,
  }));
}

export async function getStylePreferences(): Promise<{ style: string; count: number }[]> {
  // This would come from image generation data with style information
  // For now, return empty data to start fresh
  return [];
}

export async function getPerformanceMetrics(): Promise<{ metric: string; value: number }[]> {
  const [totalUsers, totalImages, activeSubscriptions, successRate] = await Promise.all([
    prisma.user.count(),
    prisma.generatedImage.count(),
    prisma.user.count({
      where: {
        stripeSubscriptionId: { not: null },
        stripeCurrentPeriodEnd: { gt: new Date() },
      },
    }),
    // Calculate success rate (placeholder)
    95,
  ]);

  return [
    { metric: "Total Users", value: totalUsers },
    { metric: "Images Generated", value: totalImages },
    { metric: "Active Subscriptions", value: activeSubscriptions },
    { metric: "Success Rate", value: successRate },
  ];
}

export async function getChartStats(): Promise<ChartStats> {
  const [userActivity, deviceDistribution, eventTypeDistribution, stylePreferences, performanceMetrics] = await Promise.all([
    getDailyStats(30),
    getDeviceDistribution(),
    getEventTypeDistribution(),
    getStylePreferences(),
    getPerformanceMetrics(),
  ]);

  return {
    userActivity,
    deviceDistribution,
    eventTypeDistribution,
    stylePreferences,
    performanceMetrics,
  };
} 