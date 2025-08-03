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
    console.log("Attempting to fetch Carousel Maker toggle setting for user:", currentUser.id);
    
    // Get user's personal setting
    const userSetting = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { carouselMakerEnabled: true }
    });
    
    console.log("Fetched user setting:", userSetting);
    return Response.json({ 
      carouselMakerEnabled: userSetting?.carouselMakerEnabled ?? false 
    });
  } catch (error) {
    console.error("GET Error:", error);
    return new Response("Failed to fetch Carousel Maker toggle setting", { status: 500 });
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
    const { carouselMakerEnabled } = body;
    
    console.log("Received Carousel Maker toggle setting for user:", currentUser.id, carouselMakerEnabled);
    
    if (typeof carouselMakerEnabled !== 'boolean') {
      return new Response("Invalid Carousel Maker toggle value", { status: 400 });
    }

    console.log("Attempting to update Carousel Maker toggle setting for user:", currentUser.id);
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: { carouselMakerEnabled: carouselMakerEnabled },
    });
    console.log("Updated user setting:", updated);

    return Response.json({ success: true, data: { carouselMakerEnabled: carouselMakerEnabled } });
  } catch (error) {
    console.error("POST Error:", error);
    return new Response("Failed to save Carousel Maker toggle setting", { status: 500 });
  }
}); 