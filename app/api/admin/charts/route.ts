import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getChartStats } from "@/lib/statistics";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Charts API Debug: Starting GET request");
    
    // Get session manually using auth() function
    const session = await auth();
    console.log("🔍 Charts API Debug: session exists:", !!session);
    console.log("🔍 Charts API Debug: session user:", session?.user);
    
    if (!session || !session.user) {
      console.log("🔍 Charts API Debug: No session found");
      return NextResponse.json({
        error: "Authentication required",
        message: "Please log in to access this resource",
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }
    
    const currentUser = session.user;
    console.log("🔍 Charts API Debug: currentUser:", currentUser);
    
    // Check if user has required permissions
    if (!currentUser.role || (currentUser.role !== 'HERO' && currentUser.role !== 'ADMIN')) {
      console.log("🔍 Charts API Debug: Insufficient permissions");
      return NextResponse.json({
        error: "Insufficient permissions",
        message: "Admin access required",
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    console.log("📊 Charts API Debug: Fetching chart statistics...");
    const stats = await getChartStats();
    console.log("✅ Charts API Debug: Chart stats fetched successfully");
    console.log("📈 Charts API Debug: User activity days:", stats.userActivity.length);
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error("❌ Charts API Error:", error);
    return NextResponse.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 