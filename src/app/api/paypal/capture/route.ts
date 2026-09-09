import { NextResponse } from "next/server";

// Retired: PayPal payments are confirmed manually from an uploaded screenshot,
// so nothing captures a PayPal order server-side any more. Kept as a 410 so a
// stale client bundle still in someone's open tab gets a clear answer rather
// than a 404. Safe to delete once no old sessions can be calling it.
export async function POST() {
  return NextResponse.json(
    { error: "PayPal capture is retired — orders are confirmed manually." },
    { status: 410 }
  );
}
