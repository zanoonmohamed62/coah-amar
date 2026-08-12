import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") === "ADMIN" ? "ADMIN" : "CUSTOMER";
  const target = role === "ADMIN" ? "/admin" : "/app";

  const response = NextResponse.redirect(new URL(target, req.url));
  response.cookies.set("dev_role", role, {
    path: "/",
    httpOnly: true,
    maxAge: 86400 * 7, // 7 days
  });

  return response;
}
