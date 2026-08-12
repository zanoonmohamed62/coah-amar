import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { updateCustomerSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const customer = await db.user.findUnique({
    where: { id, role: "CUSTOMER" },
    include: {
      orders: { orderBy: { createdAt: "desc" }, include: { product: { select: { name: true, type: true } } } },
      entitlements: { include: { product: { select: { name: true, type: true } }, order: { select: { orderRef: true, confirmedAt: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json({ customer });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const parsed = updateCustomerSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const customer = await db.user.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ customer });
}
