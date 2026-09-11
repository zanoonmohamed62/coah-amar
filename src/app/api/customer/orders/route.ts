import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth-guard";

// The customer's own orders, including the ones not yet linked to their account.
//
// An order placed at checkout carries `userId: null` whenever the buyer had no
// account at the time — which is almost always — and it is only stamped with a
// userId when an admin confirms it. Matching on userId alone therefore showed
// an empty order list to exactly the person who most needs to see one: someone
// who has paid and is waiting to be activated. Matching on the signed-in email
// as well is what makes "my orders" show the order they are waiting on.
//
// The email comparison is safe as the identity check here: the session's email
// is issued by the auth provider, not supplied by the caller.
export async function GET(_req: NextRequest) {
  const { error, session } = await requireCustomer();
  if (error) return error;

  const userId = session!.user!.id!;
  const email = (session!.user!.email ?? "").toLowerCase();

  const orders = await db.order.findMany({
    where: {
      OR: [
        { userId },
        ...(email ? [{ customerEmail: email }] : []),
      ],
    },
    select: {
      id: true,
      orderRef: true,
      status: true,
      amount: true,
      currency: true,
      paymentMethod: true,
      isRenewal: true,
      customerEmail: true,
      paymentProofId: true,
      createdAt: true,
      confirmedAt: true,
      product: { select: { name: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
    // A customer with hundreds of orders is not a real case; the cap is only
    // here so one row can never return an unbounded payload.
    take: 100,
  });

  return NextResponse.json({
    orders: orders.map(({ paymentProofId, ...o }) => ({
      ...o,
      hasProof: Boolean(paymentProofId),
    })),
  });
}
