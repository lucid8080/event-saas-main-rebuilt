import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: "Not authenticated",
        session: null
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        role: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        error: "User not found",
        sessionUserId: session.user.id,
        sessionUserEmail: session.user.email
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        role: user.role
      },
      session: {
        userId: session.user.id,
        userEmail: session.user.email
      },
      canGenerate: user.credits > 0
    });

  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json({ 
      error: "Failed to check credits",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
