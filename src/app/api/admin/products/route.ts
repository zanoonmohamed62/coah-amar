import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { createProductSchema, updateProductSchema } from "@/lib/validations";
import { ProductType } from "@prisma/client";

export async function GET(_req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const products = await db.product.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          // Must match the promo-counter query in GET /api/products, which
          // excludes FAILED orders — otherwise the admin's "spots used" and
          // live-price preview drift above what customers actually see.
          orders: { where: { status: { not: "FAILED" } } },
          entitlements: true,
        },
      },
    },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  const parsed = createProductSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const product = await db.product.create({ data: { ...parsed.data, type: parsed.data.type as ProductType } });
  return NextResponse.json({ product }, { status: 201 });
}
