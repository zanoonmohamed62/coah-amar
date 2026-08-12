import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const devRole = req.cookies.get("dev_role")?.value;

  const isLoggedIn = !!session || !!devRole;
  const role = (session?.user as { role?: string } | undefined)?.role || devRole;

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isAppRoute = nextUrl.pathname.startsWith("/app");
  const isLoginPage = nextUrl.pathname === "/login";

  // Redirect logged-in users away from login
  if (isLoginPage && isLoggedIn) {
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.redirect(new URL("/app", req.url));
  }

  // Protect /admin — must be ADMIN
  if (isAdminRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login?next=/admin", req.url));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/app", req.url));
  }

  // Protect /app — must be CUSTOMER or ADMIN
  if (isAppRoute) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login?next=/app", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/app/:path*", "/login"],
};
