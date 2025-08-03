import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const oauthStatus = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      googleClientId: process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing",
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
      authSecret: process.env.AUTH_SECRET ? "✅ Set" : "❌ Missing",
      currentUrl: request.url,
      headers: {
        host: request.headers.get("host"),
        origin: request.headers.get("origin"),
        referer: request.headers.get("referer"),
      },
      recommendations: [] as string[],
    };

    // Add recommendations based on current state
    if (!process.env.GOOGLE_CLIENT_ID) {
      oauthStatus.recommendations.push("Set GOOGLE_CLIENT_ID environment variable");
    }
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      oauthStatus.recommendations.push("Set GOOGLE_CLIENT_SECRET environment variable");
    }
    if (!process.env.AUTH_SECRET) {
      oauthStatus.recommendations.push("Generate and set AUTH_SECRET using 'npx auth secret'");
    }
    if (!process.env.NEXTAUTH_URL) {
      oauthStatus.recommendations.push("Set NEXTAUTH_URL to your application URL (e.g., http://localhost:3000)");
    }

    // Check if we're using localhost or 0.0.0.0
    const host = request.headers.get("host");
    if (host?.includes("0.0.0.0")) {
      oauthStatus.recommendations.push("Consider using 'localhost' instead of '0.0.0.0' for development");
      oauthStatus.recommendations.push("Add 'http://localhost:3000/api/auth/callback/google' to Google Cloud Console redirect URIs");
    }

    if (host?.includes("localhost")) {
      oauthStatus.recommendations.push("Add 'http://localhost:3000/api/auth/callback/google' to Google Cloud Console redirect URIs");
    }

    return NextResponse.json(oauthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check OAuth status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 