import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  const isLoggedIn = !!req.auth;
  const role = (req.auth?.user as unknown as { role?: string })?.role;

  // Admin routes — require ADMIN role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  // Customer/App routes — require any authenticated user
  if (pathname.startsWith("/app") || pathname.startsWith("/api/customer")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/app/:path*",
    "/api/admin/:path*",
    "/api/customer/:path*",
  ],
};
