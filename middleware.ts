import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("pc_session");

  if (path.startsWith("/member") || path.startsWith("/admin")) {
    if (!sessionCookie) {
      const from = path;
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/member/:path*", "/admin/:path*"],
};
