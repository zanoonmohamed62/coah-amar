import { NextResponse } from "next/server";

// The browser needs the VAPID public key to build a push subscription. It is a
// public value by definition. Answering with an empty key is how the client
// knows push is simply not configured on this deployment, and to stay quiet
// rather than showing a broken "enable notifications" button.
export async function GET() {
  const key = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  return NextResponse.json({ key, enabled: Boolean(key && process.env.VAPID_PRIVATE_KEY) });
}
