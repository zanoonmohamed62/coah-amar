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
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Count non-failed orders per product to increment dynamic counter
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

    const baseSpots: Record<string, { base: number; originalPrice: number }> = {
      'training-split': { base: 56, originalPrice: 49900 },
      'personal-coaching': { base: 16, originalPrice: 249900 },
    };

    const enhancedProducts = products.map((p) => {
      const config = baseSpots[p.slug] || { base: 0, originalPrice: p.price };
      const ordersCount = countMap[p.id] || 0;
      const spotsTaken = Math.min(100, config.base + ordersCount);
      return {
        ...p,
        originalPrice: config.originalPrice,
        spotsTaken,
        totalSpots: 100,
      };
    });

    return NextResponse.json({ products: enhancedProducts });
  } catch {
    const fallbackProducts = [
      {
        id: "prod-split",
        name: "Amar X Split",
        slug: "training-split",
        type: "TRAINING_PLAN",
        price: 29900,
        originalPrice: 49900,
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
        currency: "EGP",
        spotsTaken: 16,
        totalSpots: 100,
      },
    ];
    return NextResponse.json({ products: fallbackProducts });
  }
}
