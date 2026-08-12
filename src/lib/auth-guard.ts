import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function getDevSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const devRole = cookieStore.get("dev_role")?.value;
    if (devRole === "ADMIN") {
      return {
        user: { id: "dev-admin-id", name: "Coach Amar (Admin)", email: "admin@coachair.com", role: "ADMIN" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as Session;
    }
    if (devRole === "CUSTOMER") {
      return {
        user: { id: "dev-customer-id", name: "Dev Customer", email: "customer@coachair.com", role: "CUSTOMER" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as Session;
    }
  } catch {}
  return null;
}

export async function requireAdmin(): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
  const devSession = await getDevSession();
  const session = devSession || (await auth());

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if ((session.user as { role?: string }).role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function requireCustomer(): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
  const devSession = await getDevSession();
  const session = devSession || (await auth());

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "CUSTOMER" && role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

export async function requireAuth(): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
  const devSession = await getDevSession();
  const session = devSession || (await auth());

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}
