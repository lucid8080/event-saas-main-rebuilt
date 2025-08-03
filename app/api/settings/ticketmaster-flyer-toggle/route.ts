import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const GET = auth(async (req) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser) {
    return new Response("Invalid user", { status: 401 });
  }

  try {
    console.log("Attempting to fetch Ticketmaster flyer toggle setting for user:", currentUser.id);
    
    // Get user's personal setting
    const userSetting = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { ticketmasterFlyerEnabled: true }
    });
    
    console.log("Fetched user setting:", userSetting);
    return Response.json({ 
      ticketmasterFlyerEnabled: userSetting?.ticketmasterFlyerEnabled ?? false 
    });
  } catch (error) {
    console.error("GET Error:", error);
    return new Response("Failed to fetch Ticketmaster flyer toggle setting", { status: 500 });
  }
});

export const POST = auth(async (req) => {
  if (!req.auth) {
    return new Response("Not authenticated", { status: 401 });
  }

  const currentUser = req.auth.user;
  if (!currentUser) {
    return new Response("Invalid user", { status: 401 });
  }

  try {
    const body = await req.json();
    const { ticketmasterFlyerEnabled } = body;
    
    console.log("Received Ticketmaster flyer toggle setting for user:", currentUser.id, ticketmasterFlyerEnabled);
    
    if (typeof ticketmasterFlyerEnabled !== 'boolean') {
      return new Response("Invalid Ticketmaster flyer toggle value", { status: 400 });
    }

    console.log("Attempting to update Ticketmaster flyer toggle setting for user:", currentUser.id);
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: { ticketmasterFlyerEnabled: ticketmasterFlyerEnabled },
    });
    console.log("Updated user setting:", updated);

    return Response.json({ success: true, data: { ticketmasterFlyerEnabled: ticketmasterFlyerEnabled } });
  } catch (error) {
    console.error("POST Error:", error);
    return new Response("Failed to save Ticketmaster flyer toggle setting", { status: 500 });
  }
}); 