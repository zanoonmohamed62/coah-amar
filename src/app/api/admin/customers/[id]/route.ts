import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { isSuperAdminEmail } from "@/lib/super-admin";
import { EntitlementStatus, ProductType, Role } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const customer = await db.user.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { product: { select: { id: true, name: true, type: true, price: true } } },
      },
      entitlements: {
        include: {
          product: { select: { id: true, name: true, type: true } },
          order: { select: { orderRef: true, confirmedAt: true, amount: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const body = await req.json();

  // Action 1: Grant new entitlement
  if (body.action === "grant_entitlement") {
    const { productId, durationDays } = body;
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const isCoaching = product.type === ProductType.PERSONAL_COACHING;
    const expiresAt = durationDays
      ? new Date(Date.now() + durationDays * 86400000)
      : isCoaching
      ? new Date(Date.now() + 90 * 86400000)
      : null;

    // Create a zero-amount manual order record for traceability
    const orderRef = `MANUAL-${Math.random().toString(36).slice(-6).toUpperCase()}`;
    const user = await db.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const order = await db.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        orderRef,
        amount: 0,
        currency: "EGP",
        paymentMethod: "INSTAPAY",
        status: "CONFIRMED",
        confirmedAt: new Date(),
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || "",
        customerNotes: "Manually granted by Admin",
      },
    });

    const entitlement = await db.entitlement.create({
      data: {
        userId: user.id,
        productId: product.id,
        orderId: order.id,
        status: EntitlementStatus.ACTIVE,
        startDate: new Date(),
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, entitlement });
  }

  // Action 2: Update Entitlement Status / Expiration
  if (body.action === "update_entitlement") {
    const { entitlementId, status, extendDays } = body;
    const existing = await db.entitlement.findUnique({ where: { id: entitlementId } });
    if (!existing) return NextResponse.json({ error: "Entitlement not found" }, { status: 404 });

    let newExpiresAt = existing.expiresAt;
    if (extendDays) {
      const baseDate = existing.expiresAt && existing.expiresAt > new Date() ? existing.expiresAt : new Date();
      newExpiresAt = new Date(baseDate.getTime() + extendDays * 86400000);
    }

    const updated = await db.entitlement.update({
      where: { id: entitlementId },
      data: {
        status: status ? (status as EntitlementStatus) : existing.status,
        expiresAt: newExpiresAt,
      },
    });

    return NextResponse.json({ success: true, entitlement: updated });
  }

  // Action 3: General profile update (name, phone)
  const { name, phone } = body;
  const customer = await db.user.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(phone !== undefined ? { phone } : {}),
    },
  });

  return NextResponse.json({ customer });
}

// Permanently removes a customer along with their orders and entitlements.
// Irreversible and it moves revenue figures, so it's restricted to the owner
// account rather than any admin, and refuses to delete admins (which would be
// a way to strip a colleague's access from the wrong screen) or your own account.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  if (!isSuperAdminEmail(session.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const target = await db.user.findUnique({
    where: { id },
    select: { id: true, role: true, email: true },
  });
  if (!target) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  if (target.id === session.user?.id) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }
  if (target.role === Role.ADMIN) {
    return NextResponse.json(
      { error: "This is an admin account. Remove their admin access from Manage Admins first." },
      { status: 400 }
    );
  }

  // Entitlements reference orders, so they have to go first.
  await db.entitlement.deleteMany({ where: { userId: id } });
  await db.order.deleteMany({ where: { userId: id } });
  await db.user.delete({ where: { id } });

  // Revenue and order counts on the dashboard are derived from what we just
  // deleted, so the cached copy is now wrong.
  try {
    const { redis } = await import("@/lib/redis");
    await redis.del("admin:stats");
  } catch {}

  return NextResponse.json({ ok: true });
}
