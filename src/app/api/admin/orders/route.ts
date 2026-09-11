import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { OrderStatus, EntitlementStatus, Role, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { redis } from "@/lib/redis";
import { isSuperAdminEmail } from "@/lib/super-admin";
import { publishEvent } from "@/lib/realtime";
import { notifyUser } from "@/lib/push";

// Paged deliberately.
//
// This used to return every order in one response with the customer and product
// joined onto each. At a few hundred orders that is a slow query and a large
// payload; at the volume this launch expects it is the request that takes the
// panel down. The page now asks for one screen at a time and the table pages
// through — `total` is a separate COUNT so the pager knows how far it goes.
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const method = searchParams.get("method");
  const q = searchParams.get("q")?.trim();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(200, Math.max(1, parseInt(searchParams.get("pageSize") || "25", 10) || 25));

  const where = {
    ...(status ? { status: status as OrderStatus } : {}),
    ...(method ? { paymentMethod: method as "INSTAPAY" | "PAYPAL" | "TELDA" } : {}),
    ...(q
      ? {
          OR: [
            // The order number first: it is what a customer sends on WhatsApp
            // and the single most common thing the admin pastes in here.
            { orderRef: { contains: q, mode: "insensitive" as const } },
            { customerName: { contains: q, mode: "insensitive" as const } },
            { customerEmail: { contains: q, mode: "insensitive" as const } },
            { customerPhone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, type: true, price: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({
    orders,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  });
}

export async function PUT(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { orderRef, action } = await req.json();
  if (!orderRef || !["confirm", "reject", "refund"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { orderRef },
    include: { product: true, entitlement: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  if (action === "reject") {
    await db.order.update({
      where: { orderRef },
      data: { status: OrderStatus.FAILED },
    });
    return NextResponse.json({ success: true });
  }

  if (action === "refund") {
    await db.$transaction(async (tx: any) => {
      await tx.order.update({
        where: { orderRef },
        data: { status: OrderStatus.REFUNDED },
      });
      if (order.entitlement) {
        await tx.entitlement.update({
          where: { id: order.entitlement.id },
          data: { status: EntitlementStatus.REVOKED },
        });
      }
    });
    return NextResponse.json({ success: true });
  }

  if (order.status === OrderStatus.CONFIRMED) {
    return NextResponse.json({ success: true, note: "Already confirmed" });
  }

  let tempPassword: string | null = null;

  await db.$transaction(async (tx: any) => {
    await tx.order.update({
      where: { orderRef },
      data: { status: OrderStatus.CONFIRMED, confirmedAt: new Date() },
    });

    let user = await tx.user.findUnique({ where: { email: order.customerEmail } });
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8) + "!A1";
      user = await tx.user.create({
        data: {
          email: order.customerEmail,
          passwordHash: await bcrypt.hash(tempPassword, 12),
          name: order.customerName,
          phone: order.customerPhone,
          role: Role.CUSTOMER,
        },
      });
      await tx.order.update({ where: { orderRef }, data: { userId: user.id } });
    } else if (!user.passwordHash) {
      tempPassword = Math.random().toString(36).slice(-8) + "!A1";
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(tempPassword, 12) },
      });
    }

    const isCoaching = order.product.type === ProductType.PERSONAL_COACHING;
    const expiresAt = isCoaching ? new Date(Date.now() + 90 * 86400000) : null;

    // Keyed on this order, not on (user, product): Entitlement.orderId is
    // unique, so one entitlement belongs to exactly one order. Checking
    // (user, product) instead meant a customer who bought a second product, or
    // renewed coaching after it expired, paid and silently received nothing —
    // an older row for that pair made this skip the create. Keying on the order
    // also makes confirming the same order twice a no-op rather than a unique
    // violation that rolls the whole transaction back.
    const existing = await tx.entitlement.findUnique({
      where: { orderId: order.id },
    });
    if (!existing) {
      await tx.entitlement.create({
        data: {
          userId: user.id,
          productId: order.productId,
          orderId: order.id,
          status: EntitlementStatus.ACTIVE,
          startDate: new Date(),
          expiresAt,
        },
      });
    }
  });

  if (tempPassword) {
    try {
      const { sendAccessGrantedEmail } = await import("@/lib/email");
      await sendAccessGrantedEmail({
        to: order.customerEmail,
        name: order.customerName,
        email: order.customerEmail,
        tempPassword,
        productName: order.product.name,
        isCoaching: order.product.type === ProductType.PERSONAL_COACHING,
      });
    } catch {}
  }

  // Invalidate admin stats cache + affected customer entitlements cache
  try {
    await redis.del("admin:stats");
    // Find user by email and invalidate their entitlements cache
    const affectedUser = await db.user.findUnique({ where: { email: order.customerEmail }, select: { id: true } });
    if (affectedUser) {
      await redis.del(`customer:entitlements:${affectedUser.id}`);
      // The customer's installed app learns they are in, without them having to
      // keep checking their email.
      void notifyUser(affectedUser.id, {
        title: "تم تفعيل حسابك",
        body: `طلب ${order.orderRef} اتأكد — الجدول جاهز جوه التطبيق.`,
        url: "/app/my-split",
        tag: `activated-${order.orderRef}`,
      });
    }
  } catch {}

  // Any other admin with the panel open sees the row move out of the queue.
  try {
    publishEvent({
      type: "order.updated",
      order: {
        orderRef: order.orderRef,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        productName: order.product.name,
        amount: order.amount,
        currency: order.currency,
        paymentMethod: order.paymentMethod,
        status: OrderStatus.CONFIRMED,
        createdAt: new Date(order.createdAt).toISOString(),
      },
    });
  } catch {}

  return NextResponse.json({ success: true });
}

// Permanently remove a single order. Restricted to the super admin, like
// customer deletion, because it destroys a payment record: the order, its
// entitlement (so the customer loses access to what that order bought), and the
// uploaded payment screenshot row.
//
// This exists because there was no way to remove one order at all — the only
// cleanup available was scripts/reset-test-orders.ts, which deletes *every*
// order in the database and is far too blunt for removing a single test row.
export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  if (!isSuperAdminEmail(session.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orderRef = req.nextUrl.searchParams.get("orderRef");
  if (!orderRef) {
    return NextResponse.json({ error: "orderRef is required" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { orderRef },
    select: { id: true, paymentProofId: true },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await db.$transaction(async (tx) => {
    // Entitlement.orderId is a required relation, so it has to go first.
    await tx.entitlement.deleteMany({ where: { orderId: order.id } });
    await tx.order.delete({ where: { id: order.id } });
    // The proof row is only ever referenced by this order. The file on disk is
    // left in place: deleting it is not reversible and not required to remove
    // the order from the admin's queue.
    if (order.paymentProofId) {
      await tx.mediaAsset.deleteMany({ where: { id: order.paymentProofId } });
    }
  });

  // Dashboard revenue and counts are derived from what was just deleted.
  try {
    await redis.del("admin:stats");
  } catch {}

  return NextResponse.json({ ok: true });
}
