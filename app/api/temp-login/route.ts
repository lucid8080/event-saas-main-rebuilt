import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let email: string;
    let password: string;
    
    // Check if it's JSON or form data
    const contentType = request.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else {
      // Handle form data
      const formData = await request.formData();
      email = formData.get("email") as string;
      password = formData.get("password") as string;
    }
    
    // Simple temporary authentication - no database required
    if (email === "admin@example.com" && password === "temp123") {
      const response = NextResponse.redirect(new URL("/dashboard", request.url));
      
      // Set a simple session cookie
      response.cookies.set("temp-session", "logged-in", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 // 24 hours
      });
      
      return response;
    }
    
    // If credentials are wrong, redirect back to login with error
    return NextResponse.redirect(new URL("/basic-login?error=invalid", request.url));
    
  } catch (error) {
    console.error("Temp login error:", error);
    return NextResponse.redirect(new URL("/basic-login?error=server", request.url));
  }
} 