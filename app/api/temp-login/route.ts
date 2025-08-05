import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Simple temporary authentication - no database required
    if (email === "admin@example.com" && password === "temp123") {
      const response = NextResponse.json({ 
        success: true, 
        user: { 
          id: "temp-admin", 
          email: "admin@example.com", 
          name: "Admin User", 
          role: "ADMIN" 
        },
        message: "Login successful"
      });
      
      // Set a simple session cookie
      response.cookies.set("temp-session", "logged-in", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 // 24 hours
      });
      
      return response;
    }
    
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    );
    
  } catch (error) {
    console.error("Temp login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
} 