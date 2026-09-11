import { NextRequest, NextResponse } from "next/server";
import { touchVisitor } from "@/lib/presence";

// Visitor heartbeat. One tiny POST a minute from each open page; the
// admin dashboard reads the count off the same Redis set.
//
// Public and unauthenticated by design — the whole point is counting people who
// have not signed in. It stores only an opaque random id generated in the
// browser, never an IP or anything identifying.

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let id = "";
  try {
    const body = await req.json();
    id = typeof body?.id === "string" ? body.id.slice(0, 64) : "";
  } catch {
    /* sendBeacon with no body — fall through to the reject below */
  }
  // Only accept the shape the client generates, so the set cannot be stuffed
  // with arbitrary keys.
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await touchVisitor(id);
  return NextResponse.json({ ok: true });
}
