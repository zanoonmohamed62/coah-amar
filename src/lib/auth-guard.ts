import type { Session } from "next-auth";
import { NextResponse } from "next/server";

// Auth guards temporarily disabled for development.
// All admin/customer API routes pass through without session validation.

const DEV_ADMIN_SESSION: Session = {
  user: { id: "dev-admin-id", name: "Coach Amar (Admin)", email: "admin@coachair.com", role: "ADMIN" } as Session["user"],
  expires: new Date(Date.now() + 86400000).toISOString(),
};

const DEV_CUSTOMER_SESSION: Session = {
  user: { id: "dev-customer-id", name: "Dev Customer", email: "customer@coachair.com", role: "CUSTOMER" } as Session["user"],
  expires: new Date(Date.now() + 86400000).toISOString(),
};

export async function requireAdmin(): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
  return { session: DEV_ADMIN_SESSION };
}

export async function requireCustomer(): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
  return { session: DEV_CUSTOMER_SESSION };
}

export async function requireAuth(): Promise<{ session: Session; error?: never } | { session?: never; error: NextResponse }> {
  return { session: DEV_ADMIN_SESSION };
}
