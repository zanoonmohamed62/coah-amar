import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { Role, EntitlementStatus, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const customers = await db.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          orderRef: true,
          status: true,
          amount: true,
          confirmedAt: true,
          product: { select: { name: true } },
        },
      },
      entitlements: {
        where: { status: "ACTIVE" },
        select: {
          id: true,
          status: true,
          startDate: true,
          expiresAt: true,
          product: { select: { name: true, type: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ customers });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { name, email, phone, productId, password } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
  }

  const pass = password || Math.random().toString(36).slice(-8) + "!A1";
  const passwordHash = await bcrypt.hash(pass, 12);

  const customer = await db.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  if (productId) {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (product) {
      const orderRef = `DIR-${Math.random().toString(36).slice(-6).toUpperCase()}`;
      const isCoaching = product.type === ProductType.PERSONAL_COACHING;
      const expiresAt = isCoaching ? new Date(Date.now() + 90 * 86400000) : null;

      const order = await db.order.create({
        data: {
          userId: customer.id,
          productId: product.id,
          orderRef,
          amount: 0,
          currency: "EGP",
          paymentMethod: "INSTAPAY",
          status: "CONFIRMED",
          confirmedAt: new Date(),
          customerName: name,
          customerEmail: email,
          customerPhone: phone || "",
          customerNotes: "Direct customer onboarded via Admin",
        },
      });

      await db.entitlement.create({
        data: {
          userId: customer.id,
          productId: product.id,
          orderId: order.id,
          status: EntitlementStatus.ACTIVE,
          startDate: new Date(),
          expiresAt,
        },
      });
    }
  }

  return NextResponse.json({ success: true, customer, tempPassword: pass });
}
