import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { Role } from "@prisma/client";

// Download everything as a spreadsheet.
//
// The admin panel pages through data a screen at a time, which is right for
// browsing and wrong for "give me all of it". This streams the full table as
// CSV instead — Excel and Google Sheets both open it directly.
//
// Written out in chunks rather than assembled in memory: at tens of thousands of
// rows, building one giant string is what pushes the Node process past the
// 512 MB cap PM2 restarts it at.

export const dynamic = "force-dynamic";

// Excel decides a CSV's encoding from the BOM. Without it, every Arabic name in
// the file opens as mojibake.
const BOM = "﻿";
const CHUNK = 500;

function cell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = v instanceof Date ? v.toISOString() : String(v);
  // A leading =, +, - or @ makes Excel treat the cell as a formula; prefixing a
  // quote keeps a customer-supplied name from being executed on open.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

function row(values: unknown[]): string {
  return values.map(cell).join(",") + "\r\n";
}

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const type = req.nextUrl.searchParams.get("type") === "customers" ? "customers" : "orders";
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const stamp = new Date().toISOString().slice(0, 10);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const push = (s: string) => controller.enqueue(enc.encode(s));

      try {
        if (type === "orders") {
          push(BOM + row([
            "Order number", "Status", "Product", "Amount", "Currency",
            "Payment method", "Customer name", "Email", "WhatsApp",
            "Goal", "Level", "Notes", "Screenshot link", "Created", "Confirmed",
          ]));

          let skip = 0;
          for (;;) {
            const batch = await db.order.findMany({
              orderBy: { createdAt: "desc" },
              skip,
              take: CHUNK,
              select: {
                orderRef: true, status: true, amount: true, currency: true,
                paymentMethod: true, customerName: true, customerEmail: true,
                customerPhone: true, customerGoal: true, customerLevel: true,
                customerNotes: true, paymentProofId: true, createdAt: true,
                confirmedAt: true, product: { select: { name: true } },
              },
            });
            if (batch.length === 0) break;
            for (const o of batch) {
              push(row([
                o.orderRef, o.status, o.product?.name, (o.amount / 100).toFixed(2), o.currency,
                o.paymentMethod, o.customerName, o.customerEmail, o.customerPhone,
                o.customerGoal, o.customerLevel, o.customerNotes,
                // Opens for a signed-in admin only — /api/media restricts proofs.
                o.paymentProofId ? `${origin}/api/media/${o.paymentProofId}` : "",
                o.createdAt, o.confirmedAt,
              ]));
            }
            if (batch.length < CHUNK) break;
            skip += CHUNK;
          }
        } else {
          push(BOM + row([
            "Name", "Email", "WhatsApp", "Orders", "Active plans", "Signed up",
          ]));

          let skip = 0;
          for (;;) {
            const batch = await db.user.findMany({
              where: { role: Role.CUSTOMER },
              orderBy: { createdAt: "desc" },
              skip,
              take: CHUNK,
              select: {
                name: true, email: true, phone: true, createdAt: true,
                _count: { select: { orders: true } },
                entitlements: {
                  where: { status: "ACTIVE" },
                  select: { product: { select: { name: true } } },
                },
              },
            });
            if (batch.length === 0) break;
            for (const c of batch) {
              push(row([
                c.name, c.email, c.phone, c._count.orders,
                c.entitlements.map((e) => e.product.name).join(" | "),
                c.createdAt,
              ]));
            }
            if (batch.length < CHUNK) break;
            skip += CHUNK;
          }
        }
      } catch (err) {
        // The download has already started, so there is no status code left to
        // change. Land a visible last row rather than a silently truncated file.
        push(row([`EXPORT FAILED: ${err instanceof Error ? err.message : "unknown error"}`]));
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="amar-${type}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
