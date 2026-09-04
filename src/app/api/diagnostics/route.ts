import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import fs from "fs";
import path from "path";
import { getSetting } from "@/lib/settings";

// Read-only ops diagnostics, gated by a shared secret (reuses NEXTAUTH_SECRET,
// already present in every environment that has auth working) rather than a
// user login — lets external tooling check server health (Redis reachability,
// split PDF presence, live product/promo values) without needing admin
// credentials. Temporary: remove once VPS SSH access is set up directly.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result: Record<string, unknown> = {};

  // Redis
  try {
    const pong = await Promise.race([
      redis.ping(),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout after 3s")), 3000)),
    ]);
    result.redis = { ok: true, response: pong };
  } catch (err) {
    result.redis = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  // Split PDF presence
  try {
    const activeMediaId = await getSetting("active_split_media_id");
    let assetInfo: unknown = null;
    if (activeMediaId) {
      const asset = await db.mediaAsset.findUnique({ where: { id: activeMediaId } });
      if (asset) {
        const filePath = path.join(process.cwd(), "private_media", asset.storageKey);
        assetInfo = { assetId: asset.id, storageKey: asset.storageKey, fileExists: fs.existsSync(filePath) };
      } else {
        assetInfo = { error: "active_split_media_id set but MediaAsset row not found" };
      }
    }
    const fallbackPath = path.join(process.cwd(), "private-assets", "AMARX-SPLIT.pdf");
    result.splitPdf = {
      activeMediaId: activeMediaId || null,
      activeAsset: assetInfo,
      fallbackFileExists: fs.existsSync(fallbackPath),
    };
  } catch (err) {
    result.splitPdf = { error: err instanceof Error ? err.message : String(err) };
  }

  // Products / promo state
  try {
    const products = await db.product.findMany({
      select: {
        slug: true, price: true, originalPrice: true, discountPercent: true,
        promoCounterBase: true, promoCounterLimit: true, isActive: true,
      },
      orderBy: { sortOrder: "asc" },
    });
    result.products = products;
  } catch (err) {
    result.products = { error: err instanceof Error ? err.message : String(err) };
  }

  // DB connectivity + counts
  try {
    const [orderCount, userCount, entitlementCount] = await Promise.all([
      db.order.count(),
      db.user.count(),
      db.entitlement.count(),
    ]);
    result.db = { ok: true, orderCount, userCount, entitlementCount };
  } catch (err) {
    result.db = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json(result);
}
