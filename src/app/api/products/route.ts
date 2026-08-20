import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public endpoint — returns active products for checkout
export async function GET() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, type: true, price: true, currency: true, features: true },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ products });
}
