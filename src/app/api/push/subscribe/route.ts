import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-guard";
import { Role } from "@prisma/client";

// Register (or drop) this browser for push notifications.
//
// Which notifications a subscription gets is decided by the signed-in user's
// role, read from the session here rather than from the request body — a
// customer's browser cannot ask to receive the admin's order alerts.

export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const userId = session.user!.id!;
  const role = ((session.user as unknown as { role?: string }).role === "ADMIN"
    ? Role.ADMIN
    : Role.CUSTOMER);

  let body: { endpoint?: string; keys?: { p256dh?: string; auth?: string }; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const endpoint = body.endpoint;
  const p256dh = body.keys?.p256dh;
  const auth = body.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Incomplete subscription" }, { status: 400 });
  }

  const lang = body.lang === "en" ? "en" : "ar";

  // Keyed on the endpoint, not the user: one person legitimately has several
  // (phone, laptop), and re-subscribing on the same device must update the row
  // rather than pile up duplicates that each get their own copy of every push.
  // The upsert also re-points an endpoint at whoever is signed in now, which is
  // what should happen on a shared device.
  await db.pushSubscription.upsert({
    where: { endpoint },
    update: { userId, p256dh, auth, role, lang, failedAt: null },
    create: { userId, endpoint, p256dh, auth, role, lang },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  let endpoint = "";
  try {
    endpoint = (await req.json())?.endpoint ?? "";
  } catch {
    /* fall through to the guard below */
  }
  if (!endpoint) return NextResponse.json({ error: "endpoint is required" }, { status: 400 });

  // Scoped to the caller so one account cannot unsubscribe another's device.
  await db.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user!.id! },
  });

  return NextResponse.json({ ok: true });
}
