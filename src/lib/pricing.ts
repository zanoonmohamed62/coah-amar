import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { OrderStatus } from "@prisma/client";

// The ONE place a live price is worked out.
//
// Launch promo: the first `promoCounterLimit` buyers (counting from
// `promoCounterBase`) get `discountPercent` off `originalPrice`. Once the real
// order count pushes the counter to the limit, the discount switches itself off
// and `originalPrice` is what is charged — no admin action needed.
//
// This used to live only in GET /api/products, which is what the pages
// DISPLAY. POST /api/orders separately recorded `product.price` straight from
// the database — and that column holds the discounted figure (299 / 1,499). So
// the moment the counter reached 100, every page switched to 499 while every
// order was still written down at 299. Both now call this function, so what the
// customer sees and what the order records cannot diverge.

// Counted towards the promo: every order except a rejected one — the same rule
// the counter has always used. Since checkout now only creates an order once the
// customer has uploaded a transfer and pressed Confirm, this counts real payers,
// not people who clicked a button to have a look.

export type PricedProduct = {
  id: string;
  name: string;
  slug: string;
  type: string;
  currency: string;
  features: unknown;
  /** What checkout charges right now, in piastres. */
  price: number;
  /** Pre-discount price, in piastres. Equal to `price` when no promo runs. */
  originalPrice: number;
  discountPercent: number;
  promoActive: boolean;
  spotsTaken: number;
  totalSpots: number;
};

type Row = {
  id: string;
  name: string;
  slug: string;
  type: string;
  price: number;
  currency: string;
  features: unknown;
  originalPrice: number;
  discountPercent: number;
  promoCounterBase: number;
  promoCounterLimit: number;
};

export function derivePrice(p: Row, ordersCount: number): PricedProduct {
  const base = p.originalPrice > 0 ? p.originalPrice : p.price;
  const spotsTaken = Math.min(p.promoCounterLimit, p.promoCounterBase + ordersCount);
  const promoActive = p.discountPercent > 0 && p.originalPrice > 0 && spotsTaken < p.promoCounterLimit;
  // Round to a whole pound (100 piastres) so a percentage can't produce an odd
  // advertised price like 299.40 LE.
  const price = promoActive
    ? Math.round((base * (1 - p.discountPercent / 100)) / 100) * 100
    : base;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type,
    currency: p.currency,
    features: p.features,
    price,
    originalPrice: base,
    discountPercent: promoActive ? p.discountPercent : 0,
    promoActive,
    spotsTaken,
    totalSpots: p.promoCounterLimit,
  };
}

const SELECT = {
  id: true,
  name: true,
  slug: true,
  type: true,
  price: true,
  currency: true,
  features: true,
  originalPrice: true,
  discountPercent: true,
  promoCounterBase: true,
  promoCounterLimit: true,
} as const;

async function countFor(productIds: string[]): Promise<Record<string, number>> {
  if (productIds.length === 0) return {};
  const grouped = await db.order.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds }, status: { not: OrderStatus.FAILED } },
    _count: { id: true },
  });
  const map: Record<string, number> = {};
  for (const g of grouped) map[g.productId] = g._count.id;
  return map;
}

// The homepage reads this on every visit. Uncached, ten thousand visitors is
// ten thousand GROUP BY queries over the orders table. A short cache holds the
// load flat; it is cleared the moment an order is placed or a product edited,
// so the counter still moves the instant someone buys.
const CACHE_KEY = "products:priced";
const CACHE_TTL = 30;

/** Every active product with its live price. Cached; safe for public reads. */
export async function listPricedProducts(): Promise<PricedProduct[]> {
  try {
    const hit = await redis.get(CACHE_KEY);
    if (hit) return JSON.parse(hit) as PricedProduct[];
  } catch {
    /* Redis down — compute directly */
  }

  const rows = await db.product.findMany({
    where: { isActive: true },
    select: SELECT,
    orderBy: { sortOrder: "asc" },
  });
  const counts = await countFor(rows.map((r) => r.id));
  const priced = rows.map((r) => derivePrice(r as Row, counts[r.id] ?? 0));

  try {
    await redis.set(CACHE_KEY, JSON.stringify(priced), "EX", CACHE_TTL);
  } catch {
    /* best-effort */
  }
  return priced;
}

/**
 * The live price of one product, computed fresh — never from cache. Used by
 * order creation, where charging a stale promo price would cost real money at
 * exactly the moment the limit is reached.
 */
export async function pricedProduct(productId: string): Promise<PricedProduct | null> {
  const row = await db.product.findUnique({
    where: { id: productId, isActive: true },
    select: SELECT,
  });
  if (!row) return null;
  const counts = await countFor([row.id]);
  return derivePrice(row as Row, counts[row.id] ?? 0);
}

/** Call after anything that changes a price or the promo counter. */
export async function invalidatePricing(): Promise<void> {
  try {
    await redis.del(CACHE_KEY);
  } catch {
    /* best-effort — the 30s TTL clears it regardless */
  }
}
