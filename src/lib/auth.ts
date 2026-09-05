import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/lib/auth.config";
import { getAuthSecret } from "@/lib/auth-secret";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

function getAdminAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: getAuthSecret(),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "online",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailInput = (credentials.email as string).toLowerCase().trim();
        const passwordInput = credentials.password as string;

        try {
          const user = await db.user.findUnique({
            where: { email: emailInput },
          });

          if (user && user.passwordHash) {
            const valid = await bcrypt.compare(passwordInput, user.passwordHash);
            if (valid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              };
            }
          }
        } catch (dbError) {
          console.error("Database auth error:", dbError);
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // authConfig.jwt only sets token.role from `user` on the initial sign-in
    // request (Edge-safe, no DB access there). Sessions last up to 15 minutes,
    // so promoting someone to ADMIN from /admin/team would otherwise not take
    // effect until their token fully expired and they signed in again. This
    // override re-reads the role from the DB (Node runtime, DB access is fine
    // here) at most once every 60s per token, so a promotion/demotion shows
    // up on the user's very next request instead of up to 15 minutes later.
    async jwt(params) {
      const token = await authConfig.callbacks.jwt(params);
      const lastRoleCheck = (token as unknown as { roleCheckedAt?: number }).roleCheckedAt ?? 0;
      if (token.id && Date.now() - lastRoleCheck > 60_000) {
        try {
          const current = await db.user.findUnique({
            where: { id: token.id as string },
            select: { role: true },
          });
          if (current) token.role = current.role;
          (token as unknown as { roleCheckedAt: number }).roleCheckedAt = Date.now();
        } catch (dbError) {
          console.error("Role refresh error:", dbError);
        }
      }
      return token;
    },
    async signIn({ user, account }) {
      // Credentials sign-in is already fully validated in authorize() above.
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      const allowlist = getAdminAllowlist();
      if (allowlist.includes(email)) {
        const admin = await db.user.upsert({
          where: { email },
          update: { role: "ADMIN" },
          create: { email, name: user.name || "Admin", role: "ADMIN" },
        });
        user.id = admin.id;
        (user as unknown as { role: string }).role = admin.role;
        return true;
      }

      // Anyone can sign in with Google (lead capture for marketing). Split/PDF
      // access is gated separately by Entitlement, not by how the account was
      // created — see /api/split's hasSplitAccess check.
      const account_ = await db.user.upsert({
        where: { email },
        update: {},
        create: { email, name: user.name || email.split("@")[0], role: "CUSTOMER" },
      });
      user.id = account_.id;
      (user as unknown as { role: string }).role = account_.role;
      return true;
    },
  },
});
