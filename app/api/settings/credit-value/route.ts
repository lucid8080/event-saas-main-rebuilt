import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Attempting to fetch credit value");
    const setting = await prisma.settings.findUnique({
      where: { key: "creditValue" },
    });
    console.log("Fetched setting:", setting);
    return NextResponse.json({ creditValue: setting?.value ?? 0 });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch credit value" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { creditValue } = await request.json();
    console.log("Received credit value:", creditValue);
    
    if (typeof creditValue !== 'number' || isNaN(creditValue)) {
      return NextResponse.json({ error: "Invalid credit value" }, { status: 400 });
    }

    console.log("Attempting to update credit value");
    const updated = await prisma.settings.upsert({
      where: { key: "creditValue" },
      update: { value: creditValue },
      create: { key: "creditValue", value: creditValue },
    });
    console.log("Updated setting:", updated);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to save credit value" }, { status: 500 });
  }
} 