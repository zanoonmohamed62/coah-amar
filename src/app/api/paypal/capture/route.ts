import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, reset } = await rateLimit(`paypal-capture:${ip}`, 10, 60);
  if (!allowed) return rateLimitResponse(reset);

  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;
  if (!token) return NextResponse.json({ error: "token is required" }, { status: 400 });

  try {
    const { success } = await capturePayPalOrder(token);
    return NextResponse.json({ success });
  } catch (err) {
    console.error("capturePayPalOrder failed:", err);
    return NextResponse.json({ success: false }, { status: 502 });
  }
}
