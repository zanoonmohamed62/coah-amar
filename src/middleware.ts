import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/admin/:path*",
    "/app/:path*",
    "/api/admin/:path*",
    "/api/customer/:path*",
    "/api/split/:path*",
  ],
};
