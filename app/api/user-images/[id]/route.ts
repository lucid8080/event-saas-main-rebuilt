import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { deleteImageFromR2 } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const image = await prisma.generatedImage.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({ image });
  } catch (error) {
    console.error("Error fetching image:", error);
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

    const image = await prisma.generatedImage.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Update the image's public status
    const updatedImage = await prisma.generatedImage.update({
      where: {
        id: params.id,
      },
      data: {
        isPublic,
      },
    });

    return NextResponse.json({ image: updatedImage });
  } catch (error) {
    console.error("Error updating image:", error);
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

    const image = await prisma.generatedImage.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      select: { id: true, r2Key: true }
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from R2 if the image is stored there
    if (image.r2Key) {
      try {
        await deleteImageFromR2(image.r2Key);
        console.log(`Image deleted from R2: ${image.r2Key}`);
      } catch (r2Error) {
        console.error('Error deleting image from R2:', r2Error);
        // Continue with database deletion even if R2 deletion fails
      }
    }

    // Delete from database
    await prisma.generatedImage.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 