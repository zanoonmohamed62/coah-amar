import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

type Params = { params: Promise<{ orderRef: string }> };

function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Everything the customer's payment page needs, in one request, so a reload
// never loses their place. Reachable without a session — most customers order
// before they ever create an account — so the unguessable accessToken is the
// access check, not the short, client-generated orderRef.
export async function GET(req: NextRequest, { params }: Params) {
  const ip = getClientIp(req);
  const { allowed, reset } = await rateLimit(`order-detail:${ip}`, 30, 60);
  if (!allowed) return rateLimitResponse(reset);

  const { orderRef } = await params;
  const token = req.nextUrl.searchParams.get("token") || "";
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const order = await db.order.findUnique({
    where: { orderRef },
    select: {
      orderRef: true,
      accessToken: true,
      status: true,
      amount: true,
      currency: true,
      paymentMethod: true,
      customerName: true,
      customerEmail: true,
      confirmedAt: true,
      paymentProofId: true,
      createdAt: true,
      product: { select: { name: true, type: true } },
    },
  });

  // Same 404 for "no such order" and "wrong token", so this can't be used to
  // discover which order refs exist.
  if (!order || !tokenMatches(token, order.accessToken)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { accessToken: _accessToken, paymentProofId, ...safe } = order;

  return NextResponse.json({
    order: { ...safe, hasProof: Boolean(paymentProofId) },
  });
}
