import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const carousel = await prisma.generatedCarousel.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!carousel) {
      return NextResponse.json({ error: "Carousel not found" }, { status: 404 });
    }

    return NextResponse.json({ carousel });
  } catch (error) {
    console.error("Error fetching carousel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { isPublic } = body;

    // Validate the request body
    if (typeof isPublic !== "boolean") {
      return NextResponse.json(
        { error: "isPublic must be a boolean" },
        { status: 400 }
      );
    }

    const carousel = await prisma.generatedCarousel.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!carousel) {
      return NextResponse.json({ error: "Carousel not found" }, { status: 404 });
    }

    // Update the carousel's public status
    const updatedCarousel = await prisma.generatedCarousel.update({
      where: {
        id: params.id,
      },
      data: {
        isPublic,
      },
    });

    return NextResponse.json({ carousel: updatedCarousel });
  } catch (error) {
    console.error("Error updating carousel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const carousel = await prisma.generatedCarousel.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!carousel) {
      return NextResponse.json({ error: "Carousel not found" }, { status: 404 });
    }

    await prisma.generatedCarousel.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Carousel deleted successfully" });
  } catch (error) {
    console.error("Error deleting carousel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 