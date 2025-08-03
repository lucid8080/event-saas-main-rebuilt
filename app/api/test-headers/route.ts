import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get header information
    const headers = Object.fromEntries(request.headers.entries());
    const headerSize = JSON.stringify(headers).length;
    
    return NextResponse.json({
      success: true,
      message: "Headers test successful",
      headerCount: Object.keys(headers).length,
      headerSize: `${headerSize} bytes`,
      maxHeaderSize: "8KB",
      isLarge: headerSize > 8192,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Header test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Header test failed",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 