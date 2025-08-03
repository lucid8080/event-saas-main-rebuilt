import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Attempting to fetch marquee toggle setting");
    const setting = await prisma.settings.findUnique({
      where: { key: "marqueeEnabled" },
    });
    console.log("Fetched setting:", setting);
    return NextResponse.json({ marqueeEnabled: setting?.value === 1 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch marquee toggle setting" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { marqueeEnabled } = await request.json();
    console.log("Received marquee toggle setting:", marqueeEnabled);
    
    if (typeof marqueeEnabled !== 'boolean') {
      return NextResponse.json({ error: "Invalid marquee toggle value" }, { status: 400 });
    }

    console.log("Attempting to update marquee toggle setting");
    const updated = await prisma.settings.upsert({
      where: { key: "marqueeEnabled" },
      update: { value: marqueeEnabled ? 1 : 0 },
      create: { key: "marqueeEnabled", value: marqueeEnabled ? 1 : 0 },
    });
    console.log("Updated setting:", updated);

    return NextResponse.json({ success: true, data: { marqueeEnabled: marqueeEnabled } });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to save marquee toggle setting" }, { status: 500 });
  }
} 