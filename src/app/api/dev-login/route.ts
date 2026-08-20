import { NextRequest, NextResponse } from "next/server";

// Dev shortcut: sets the dev_role cookie and redirects to the target panel.
// Remove this route before going to production.
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") || "ADMIN";
  const redirect = role === "ADMIN" ? "/admin" : "/app";

  const res = NextResponse.redirect(new URL(redirect, req.url));
  res.cookies.set("dev_role", role, {
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: "lax",
  });
  return res;
}
