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
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // For now, return empty transactions since we don't have a transactions table yet
    // In the future, this would query a transactions table or Stripe API
    const transactions: any[] = [];
    const totalTransactions = 0;

    return Response.json({
      transactions,
      pagination: {
        page,
        limit,
        total: totalTransactions,
        totalPages: Math.ceil(totalTransactions / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new Response("Internal server error", { status: 500 });
  }
}); 