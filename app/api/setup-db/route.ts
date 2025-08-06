import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function POST() {
  try {
    console.log("🔧 Setting up database schema via API...");
    
    const prisma = new PrismaClient();
    
    // Test if the users table exists by trying to query it
    try {
      await prisma.user.count();
      console.log("✅ Users table already exists");
      
      return NextResponse.json({
        status: "success",
        message: "Database is already set up correctly",
      });
    } catch (error) {
      console.log("❌ Users table doesn't exist, attempting to create...");
      
      // If the table doesn't exist, we need to run the migration
      // Since we can't run shell commands from an API route,
      // we'll return instructions for manual setup
      
      return NextResponse.json({
        status: "error",
        message: "Database schema needs to be set up",
        instructions: [
          "1. Go to your Render dashboard",
          "2. Update your Build Command to: npx prisma generate && npx prisma migrate deploy && npm run build",
          "3. Trigger a new deployment",
          "Or use the alternative: npx prisma generate && npx prisma db push && npm run build"
        ],
        error: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Database setup API error:", error);
    
    return NextResponse.json({
      status: "error",
      message: "Database setup failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 