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
    console.log("Attempting to fetch watermark toggle setting for user:", currentUser.id);
    
    // Get user's personal setting
    const userSetting = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { watermarkEnabled: true }
    });
    
    console.log("Fetched user setting:", userSetting);
    return Response.json({ 
      watermarkEnabled: userSetting?.watermarkEnabled ?? false 
    });
  } catch (error) {
    console.error("GET Error:", error);
    return new Response("Failed to fetch watermark toggle setting", { status: 500 });
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
    const { watermarkEnabled } = body;
    
    console.log("Received watermark toggle setting for user:", currentUser.id, watermarkEnabled);
    
    if (typeof watermarkEnabled !== 'boolean') {
      return new Response("Invalid watermark toggle value", { status: 400 });
    }

    console.log("Attempting to update watermark toggle setting for user:", currentUser.id);
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: { watermarkEnabled: watermarkEnabled },
    });
    console.log("Updated user setting:", updated);

    return Response.json({ success: true, data: { watermarkEnabled: watermarkEnabled } });
  } catch (error) {
    console.error("POST Error:", error);
    return new Response("Failed to save watermark toggle setting", { status: 500 });
  }
}); 