import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Strict Institutional Security Headers
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
