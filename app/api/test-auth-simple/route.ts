import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Simple API Test: Starting GET request");
    
    // Check if we can access request headers
    const authHeader = request.headers.get('authorization');
    console.log("🔍 Auth header:", authHeader);
    
    return NextResponse.json({
      message: "Simple API test successful",
      authHeader: authHeader ? "Present" : "Missing",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Simple API Test Error:", error);
    return NextResponse.json({
      error: "Simple API test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Simple API Test: Starting POST request");
    
    const body = await request.json();
    console.log("🔍 Request body:", body);
    
    return NextResponse.json({
      message: "Simple POST test successful",
      receivedBody: body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Simple API Test Error:", error);
    return NextResponse.json({
      error: "Simple API test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 