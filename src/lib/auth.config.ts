import type { NextAuthConfig } from "next-auth";
import { getAuthSecret } from "@/lib/auth-secret";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true,
  // Customers are never signed out by a timer.
  //
  // A customer's session is what unlocks their offline copy of the plan: the
  // viewer finds it by user id, and signing out wipes it (forgetOfflineSplit).
  // With the old 15-minute session, an athlete who put the phone down between
  // sets came back signed out with the whole plan deleted, and re-downloaded it
  // from scratch the next time they had signal — which is exactly the "it
  // reloads every single time" the portal was reported for.
  //
  // Admins are the opposite case: their session can confirm payments and read
  // every customer's details, so it still expires — after an hour of inactivity,
  // enforced per-role in `authorized` below rather than by this global cap.
  session: { strategy: "jwt", maxAge: 365 * 24 * 60 * 60 },
  secret: getAuthSecret(),
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Inactivity timeout — admins only, one hour. Customers are exempt on
      // purpose (see the session config above): their session is what keeps the
      // offline plan readable, so expiring it costs them the download.
      const role = (auth?.user as unknown as { role?: string } | undefined)?.role;
      if (isLoggedIn && role === "ADMIN") {
        const lastActivity = (auth as unknown as { lastActivity?: number })?.lastActivity;
        const ADMIN_TIMEOUT_MS = 60 * 60 * 1000;
        if (lastActivity && Date.now() - lastActivity > ADMIN_TIMEOUT_MS) {
          // API callers get JSON — an HTML redirect body parsed as JSON is what
          // surfaced in the panel as an unexplained crash rather than "signed out".
          if (pathname.startsWith("/api/")) {
            return Response.json({ error: "Session expired" }, { status: 401 });
          }
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
      // Slide the activity stamp forward on every request the token is read on,
      // so the admin's hour is an hour of genuine inactivity rather than a hard
      // cap that logs them out mid-review.
      if (trigger === "update" || !token.lastActivity) {
        token.lastActivity = Date.now();
      } else if (token.role === "ADMIN") {
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
