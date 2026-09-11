import { NextResponse } from 'next/server';
import { listPricedProducts } from '@/lib/pricing';

export async function GET() {
  try {
    // Price derivation — including switching the launch discount off at the
    // limit — lives in src/lib/pricing.ts, shared with order creation so the
    // displayed price and the charged price are the same number by construction.
    const products = await listPricedProducts();
    return NextResponse.json(
      { products },
      // Lets the CDN/browser absorb bursts on the homepage. Short enough that a
      // price change or the promo ending shows up within seconds.
      { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } }
    );
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
