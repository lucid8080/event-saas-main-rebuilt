import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Test basic connection
    await prisma.$connect();
    console.log("Database connection successful");
    
    // Test if User model exists and has required fields
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
    
    // Test if we can query the User model structure
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        name: true,
        role: true,
      },
    });
    
    console.log("Sample user query successful");
    
    return NextResponse.json({
      status: "success",
      message: "Database connection and User model are working",
      userCount,
      hasUsernameField: sampleUser !== null,
    });
    
  } catch (error) {
    console.error("Database test error:", error);
    
    return NextResponse.json({
      status: "error",
      message: "Database test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 