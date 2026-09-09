import { NextResponse } from "next/server";

// PayPal is confirmed manually now, exactly like InstaPay and Telda: the
// customer pays via the PayPal.me link, uploads a screenshot, and an admin
// confirms the order in /admin/orders. There is no automatic activation path.
//
// This endpoint stays mounted only so any webhook subscription still configured
// on the PayPal side gets a clean 410 instead of a 404 in the logs. It never
// creates orders, users, or entitlements. Unsubscribe the webhook in the PayPal
// dashboard and this file can be deleted.
export async function POST() {
  return NextResponse.json(
    { error: "PayPal webhooks are no longer processed — orders are confirmed manually." },
    { status: 410 }
  );
}
