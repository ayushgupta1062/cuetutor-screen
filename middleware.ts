import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /dashboard/home/** routes
  if (pathname.startsWith("/dashboard/home")) {
    const authCookie = request.cookies.get("ct_auth");
    if (!authCookie || authCookie.value !== "authenticated") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/home/:path*"],
};
