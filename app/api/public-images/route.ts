import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getImageUrl } from "@/lib/gallery-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("eventType");
    const limit = parseInt(searchParams.get("limit") || "6"); // Changed from 20 to 6 for consistency
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build the where clause
    const whereClause: any = {
      isPublic: true,
    };

    // Add event type filter if provided
    if (eventType && eventType !== "all") {
      whereClause.eventType = eventType.toUpperCase();
    }

    // Fetch public images with pagination
    const images = await prisma.generatedImage.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.generatedImage.count({
      where: whereClause,
    });

    // Generate proper URLs for each image
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        try {
          const properUrl = await getImageUrl(image.id, 'gallery');
          return {
            ...image,
            url: properUrl
          };
        } catch (error) {
          console.error(`Error generating URL for image ${image.id}:`, error);
          return image; // Return original image if URL generation fails
        }
      })
    );

    return NextResponse.json({
      images: imagesWithUrls,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching public images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 