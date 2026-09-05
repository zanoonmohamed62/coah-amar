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

      // Admin API — authentication only. This middleware runs on the Edge, where
      // there's no DB, so `role` here is whatever the JWT was minted with and can
      // be up to a session old: a user promoted to ADMIN from /admin/team would
      // be bounced here while the database already says they're an admin, and an
      // API call would get an HTML login redirect instead of JSON. Every route
      // under /api/admin calls requireAdmin(), which checks the role server-side
      // against the DB, so that is the real gate.
      if (pathname.startsWith("/api/admin")) {
        if (!isLoggedIn) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        return true;
      }

      // Admin pages — same staleness caveat, so a non-admin role only redirects
      // rather than being treated as authoritative; the pages themselves load
      // their data through the API routes above, which enforce the real check.
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
          const redirectUrl = new URL("/login", nextUrl.origin);
          redirectUrl.searchParams.set("callbackUrl", pathname);
          return Response.redirect(redirectUrl);
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
      // Role changes aren't read here — this callback also runs on the Edge,
      // where there's no DB. The override in auth.ts refreshes token.role from
      // the database on the Node side.
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
