import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const GET = auth(async (req) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "HERO")) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    // Get user statistics
    const [
      totalUsers,
      totalAdmins,
      totalImages,
      activeSubscriptions,
      newUsersThisMonth,
      newUsersLastMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.generatedImage.count(),
      prisma.user.count({
        where: {
          stripeSubscriptionId: { not: null },
          stripeCurrentPeriodEnd: { gt: new Date() },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
            lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    // Calculate growth percentage
    const userGrowth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : 0;

    return Response.json({
      totalUsers,
      totalAdmins,
      totalImages,
      activeSubscriptions,
      newUsersThisMonth,
      userGrowth: Math.round(userGrowth * 10) / 10, // Round to 1 decimal place
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return new Response("Internal server error", { status: 500 });
  }
}); 