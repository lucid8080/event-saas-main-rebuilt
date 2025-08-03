import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Update message status validation schema
const UpdateMessageSchema = z.object({
  status: z.enum(["NEW", "READ", "RESPONDED", "ARCHIVED"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate the request body
    const validatedData = UpdateMessageSchema.parse(body);
    
    // Update the contact message status
    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: validatedData.status,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: "Message status updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid status data", 
          errors: error.errors 
        },
        { status: 400 }
      );
    }
    
    if (error.code === "P2025") {
      return NextResponse.json(
        { 
          success: false, 
          message: "Message not found" 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while updating the message status." 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve a specific message
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });
    
    if (!message) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Message not found" 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: message,
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while fetching the message." 
      },
      { status: 500 }
    );
  }
} 