import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

type Params = { params: Promise<{ orderRef: string }> };

function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Public but token-scoped — a customer paying via InstaPay/Telda usually has no
// session yet at this point in the funnel, so this can't be gated behind
// requireAuth/requireCustomer. The unguessable accessToken is the access check;
// orderRef alone is not, since the browser builds it from a timestamp plus four
// characters and it appears in emails and screenshots.
export async function POST(req: NextRequest, { params }: Params) {
  const ip = getClientIp(req);
  const { allowed, reset } = await rateLimit(`payment-proof:${ip}`, 8, 60);
  if (!allowed) return rateLimitResponse(reset);

  const { orderRef } = await params;
  const token = req.nextUrl.searchParams.get("token") || "";

  const order = await db.order.findUnique({ where: { orderRef } });
  // Same 404 for a missing order and a bad token, so this can't confirm which
  // order refs exist.
  if (!order || !token || !tokenMatches(token, order.accessToken)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentMethod === "PAYPAL") {
    return NextResponse.json({ error: "PayPal orders are confirmed automatically — no proof needed." }, { status: 400 });
  }
  if (order.status !== "AWAITING_CONFIRMATION") {
    return NextResponse.json({ error: "This order is no longer awaiting payment confirmation." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const storageKey = `proof-${orderRef}-${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), "private_media");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, storageKey), buffer);

  // Payment screenshots are customer PII — stored protected (isProtected: true),
  // never in the public/uploads path the Site Editor uses for homepage images.
  const asset = await db.mediaAsset.create({
    data: {
      filename: storageKey,
      originalName: file.name,
      mimeType: file.type,
      size: buffer.length,
      storageKey,
      isProtected: true,
      uploadedBy: order.userId, // may be null — customer often has no account yet
    },
  });

  await db.order.update({
    where: { orderRef },
    data: { paymentProofId: asset.id },
  });

  return NextResponse.json({ ok: true, assetId: asset.id });
}
