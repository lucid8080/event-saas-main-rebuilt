import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Attempting to fetch image edit toggle setting");
    const setting = await prisma.settings.findUnique({
      where: { key: "imageEditEnabled" },
    });
    console.log("Fetched setting:", setting);
    return NextResponse.json({ imageEditEnabled: setting?.value === 1 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch image edit toggle setting" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { imageEditEnabled } = await request.json();
    console.log("Received image edit toggle setting:", imageEditEnabled);
    
    if (typeof imageEditEnabled !== 'boolean') {
      return NextResponse.json({ error: "Invalid image edit toggle value" }, { status: 400 });
    }

    console.log("Attempting to update image edit toggle setting");
    const updated = await prisma.settings.upsert({
      where: { key: "imageEditEnabled" },
      update: { value: imageEditEnabled ? 1 : 0 },
      create: { key: "imageEditEnabled", value: imageEditEnabled ? 1 : 0 },
    });
    console.log("Updated setting:", updated);

    return NextResponse.json({ success: true, data: { imageEditEnabled: imageEditEnabled } });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to save image edit toggle setting" }, { status: 500 });
  }
} 