import { auth } from "@/lib/auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";

export async function requireAdmin(): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const role = (session.user as unknown as { role: string }).role;
  if (role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session: session as Session };
}

export async function requireCustomer(): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const role = (session.user as unknown as { role: string }).role;
  if (role !== "CUSTOMER" && role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session: session as Session };
}

export async function requireAuth(): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
  const session = await auth();

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  return { session: session as Session };
}
