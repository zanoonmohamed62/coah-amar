import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/lib/auth-secret";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  session: { strategy: "jwt", maxAge: 15 * 60 }, // 15 minutes
  secret: getAuthSecret(),
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as unknown as { role?: string })?.role;
      const { pathname } = nextUrl;

      // Check inactivity timeout (15 minutes)
      if (isLoggedIn) {
        const lastActivity = (auth as unknown as { lastActivity?: number })?.lastActivity;
        const TIMEOUT_MS = 15 * 60 * 1000;
        if (lastActivity && Date.now() - lastActivity > TIMEOUT_MS) {
          const loginUrl = new URL("/login", nextUrl.origin);
          loginUrl.searchParams.set("reason", "timeout");
          return Response.redirect(loginUrl);
        }
      }

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
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.lastActivity = Date.now();
      }
      // Refresh lastActivity on every token update (page navigation / API call)
      if (trigger === "update") {
        token.lastActivity = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as { role: string }).role = token.role as string;
        (session as unknown as { lastActivity: number }).lastActivity = token.lastActivity as number;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
