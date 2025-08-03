import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// PUT /api/personal-events/[id] - Update a personal event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, date, type, description, recurring, color } = body;

    console.log("PUT API received data:", body);
    console.log("PUT Date received:", date);
    console.log("PUT Date type:", typeof date);

    if (!title || !date || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the event belongs to the user
    const existingEvent = await prisma.personalEvent.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Validate date format and handle timezone properly
    // If date is in YYYY-MM-DD format, treat it as local date
    let parsedDate: Date;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      // Create date in local timezone (midnight) - use UTC to avoid timezone shifts
      const [year, month, day] = date.split('-').map(Number);
      parsedDate = new Date(Date.UTC(year, month - 1, day)); // Use UTC to preserve the exact date
    } else {
      parsedDate = new Date(date);
    }
    
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    console.log("PUT Parsed date:", parsedDate);
    console.log("PUT Date ISO string:", parsedDate.toISOString());

    const event = await prisma.personalEvent.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        date: parsedDate,
        type,
        description,
        recurring: recurring ?? true,
        color: color ?? "pink",
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating personal event:", error);
    return NextResponse.json(
      { error: "Failed to update personal event" },
      { status: 500 }
    );
  }
}

// DELETE /api/personal-events/[id] - Delete a personal event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the event belongs to the user
    const existingEvent = await prisma.personalEvent.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.personalEvent.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting personal event:", error);
    return NextResponse.json(
      { error: "Failed to delete personal event" },
      { status: 500 }
    );
  }
} 