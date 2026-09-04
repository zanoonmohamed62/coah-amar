import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: {
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
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Count non-failed orders per product to increment the live promo counter
    const orderCounts = await db.order.groupBy({
      by: ['productId'],
      where: {
        status: { not: 'FAILED' },
      },
      _count: {
        id: true,
      },
    }).catch(() => []);

    const countMap: Record<string, number> = {};
    for (const item of orderCounts) {
      countMap[item.productId] = item._count.id;
    }

    // The promo is admin-controlled (Product.originalPrice/discountPercent/
    // promoCounterBase/promoCounterLimit, edited in /admin/products) — this
    // route only derives the live price/counter from those fields, it never
    // writes anything back. Once the real order count pushes spotsTaken to
    // the limit, the discount turns off automatically and the customer is
    // charged originalPrice.
    const enhancedProducts = products.map((p) => {
      const ordersCount = countMap[p.id] || 0;
      const spotsTaken = Math.min(p.promoCounterLimit, p.promoCounterBase + ordersCount);
      const promoActive = p.discountPercent > 0 && p.originalPrice > 0 && spotsTaken < p.promoCounterLimit;
      // Round to a whole pound (100 piastres) so a percentage discount can't
      // produce an odd advertised price like 299.40 LE.
      const price = promoActive
        ? Math.round((p.originalPrice * (1 - p.discountPercent / 100)) / 100) * 100
        : (p.originalPrice || p.price);

      return {
        ...p,
        price,
        originalPrice: p.originalPrice || p.price,
        promoActive,
        spotsTaken,
        totalSpots: p.promoCounterLimit,
      };
    });

    return NextResponse.json({ products: enhancedProducts });
  } catch {
    // Last-resort static snapshot, only used if the DB query itself throws
    // (e.g. DB unreachable) — not the live source of truth.
    const fallbackProducts = [
      {
        id: "prod-split",
        name: "Amar X Split",
        slug: "training-split",
        type: "TRAINING_PLAN",
        price: 29900,
        originalPrice: 49900,
        promoActive: true,
        currency: "EGP",
        spotsTaken: 56,
        totalSpots: 100,
      },
      {
        id: "prod-coaching",
        name: "Personal Coaching",
        slug: "personal-coaching",
        type: "PERSONAL_COACHING",
        price: 149900,
        originalPrice: 249900,
        promoActive: true,
        currency: "EGP",
        spotsTaken: 16,
        totalSpots: 100,
      },
    ];
    return NextResponse.json({ products: fallbackProducts });
  }
}
