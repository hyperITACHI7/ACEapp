import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "./server/auth/constants";

// Edge middleware can't hit Postgres, so this is only a cheap cookie-presence gate.
// Real session validation (expiry, user lookup) happens in (app)/layout.tsx server component.
export function middleware(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
  if (!hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/onboarding/:path*"],
};
