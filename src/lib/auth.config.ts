import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/lib/auth-secret";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  session: { strategy: "jwt" },
  secret: getAuthSecret(),
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as unknown as { role?: string })?.role;
      const { pathname } = nextUrl;

      // Admin routes — require ADMIN role
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (!isLoggedIn) {
          const redirectUrl = new URL("/login", nextUrl.origin);
          redirectUrl.searchParams.set("callbackUrl", pathname);
          return Response.redirect(redirectUrl);
        }
        if (role !== "ADMIN") {
          const loginUrl = new URL("/login", nextUrl.origin);
          loginUrl.searchParams.set("callbackUrl", "/admin");
          loginUrl.searchParams.set("reason", "unauthorized");
          return Response.redirect(loginUrl);
        }
        return true;
      }

      // Customer/App routes — require any authenticated user
      if (pathname.startsWith("/app") || pathname.startsWith("/api/customer") || pathname.startsWith("/api/split")) {
        if (!isLoggedIn) {
          const redirectUrl = new URL("/login", nextUrl.origin);
          redirectUrl.searchParams.set("callbackUrl", pathname);
          return Response.redirect(redirectUrl);
        }
        return true;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
