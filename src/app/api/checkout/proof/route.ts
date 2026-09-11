import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

// Payment screenshot upload that happens BEFORE an order exists.
//
// The order is created only when the customer presses Confirm, which they can
// only do once they have uploaded their transfer — so the screenshot has to be
// storable on its own first. Previously an order row was written the moment
// anyone clicked "Get the Split", which filled the admin queue with people who
// were only having a look and never paid.
//
// The upload is handed back with an unguessable claim token. POST /api/orders
// attaches the asset only to whoever presents that token, and stamps
// `claimedAt` so one upload can't be pinned to two different orders.
//
// Nothing here is tied to a session: at this point in the funnel the customer
// almost never has an account yet.

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Deliberately tighter than the order rate limit: this one writes a file to
  // disk, so it is the expensive endpoint to abuse.
  const { allowed, reset } = await rateLimit(`checkout-proof:${ip}`, 10, 300);
  if (!allowed) return rateLimitResponse(reset);

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // Some Android browsers send an empty or generic type for a camera capture,
  // so fall back to the extension rather than rejecting a genuine screenshot.
  const ext = (path.extname(file.name).toLowerCase() || ".jpg").slice(0, 6);
  const looksLikeImage =
    ALLOWED.includes(file.type) ||
    (file.type.startsWith("image/")) ||
    [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"].includes(ext);
  if (!looksLikeImage) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const claimToken = randomBytes(24).toString("base64url");
  const storageKey = `proof-pending-${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const uploadDir = path.join(process.cwd(), "private_media");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, storageKey), buffer);

  // Payment screenshots are customer PII — stored protected, never in the
  // public uploads path the Site Editor uses for homepage images.
  const asset = await db.mediaAsset.create({
    data: {
      filename: storageKey,
      originalName: file.name || storageKey,
      mimeType: file.type || "image/jpeg",
      size: buffer.length,
      storageKey,
      isProtected: true,
      uploadedBy: null,
      claimToken,
    },
  });

  return NextResponse.json({ assetId: asset.id, claimToken, size: buffer.length });
}
