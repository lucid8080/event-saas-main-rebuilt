import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Simple temporary authentication
    if (email === "admin@example.com" && password === "temp123") {
      // Create or get user
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            name: "Admin User",
            role: "ADMIN"
          }
        });
      }
      
      const response = NextResponse.json({ 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
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