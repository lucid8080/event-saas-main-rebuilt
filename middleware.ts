import { auth } from "@/auth";

export default auth((req) => {
  // Minimal middleware - only handle authentication
  // Don't manipulate headers to avoid 431 errors
  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};