import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for temporary session
  const tempSession = request.cookies.get("temp-session");
  
  // If user has temp session and tries to access login, redirect to dashboard
  if (tempSession?.value === "logged-in" && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user has temp session, allow access to protected routes
  if (tempSession?.value === "logged-in") {
    return NextResponse.next();
  }

  // Handle NextAuth.js authentication
  const authHeader = request.headers.get("authorization");
  const isApiRoute = pathname.startsWith("/api/");
  const isAuthRoute = pathname.startsWith("/api/auth/");
  const isPublicRoute = pathname === "/" || 
                       pathname.startsWith("/_next/") || 
                       pathname.startsWith("/api/") ||
                       pathname.includes(".") ||
                       pathname.startsWith("/temp-login") ||
                       pathname.startsWith("/login") ||
                       pathname.startsWith("/register") ||
                       pathname.startsWith("/about") ||
                       pathname.startsWith("/contact") ||
                       pathname.startsWith("/pricing") ||
                       pathname.startsWith("/themes") ||
                       pathname.startsWith("/blog") ||
                       pathname.startsWith("/docs") ||
                       pathname.startsWith("/guides") ||
                       pathname.startsWith("/faq") ||
                       pathname.startsWith("/privacy") ||
                       pathname.startsWith("/terms");

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for authentication
  const token = request.cookies.get("next-auth.session-token") || 
                request.cookies.get("__Secure-next-auth.session-token");

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};