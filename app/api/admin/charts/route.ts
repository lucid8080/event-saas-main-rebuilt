import { auth } from "@/auth";
import { getChartStats } from "@/lib/statistics";

export const GET = auth(async (req) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "HERO")) {
    return new Response("Unauthorized", { status: 403 });
  }

  try {
    const stats = await getChartStats();
    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching chart stats:", error);
    return new Response("Internal server error", { status: 500 });
  }
}); 