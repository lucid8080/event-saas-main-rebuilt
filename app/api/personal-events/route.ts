import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /api/personal-events - Get all personal events for the current user
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await prisma.personalEvent.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'asc',
      },
    });

    console.log("Fetched events:", events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date,
      dateISO: event.date.toISOString(),
      dateLocal: event.date.toLocaleDateString()
    })));

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching personal events:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal events" },
      { status: 500 }
    );
  }
}

// POST /api/personal-events - Create a new personal event
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, date, type, description, recurring, color } = body;

    console.log("API received data:", body);
    console.log("Date received:", date);
    console.log("Date type:", typeof date);

    if (!title || !date || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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

    console.log("Parsed date:", parsedDate);
    console.log("Date ISO string:", parsedDate.toISOString());

    const event = await prisma.personalEvent.create({
      data: {
        userId: session.user.id,
        title,
        date: parsedDate,
        type,
        description,
        recurring: recurring ?? true,
        color: color ?? "pink",
      },
    });

    console.log("Created event:", {
      id: event.id,
      title: event.title,
      date: event.date,
      dateISO: event.date.toISOString(),
      dateLocal: event.date.toLocaleDateString()
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating personal event:", error);
    return NextResponse.json(
      { error: "Failed to create personal event" },
      { status: 500 }
    );
  }
} 