import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { notifyCustomers } from "@/lib/push";

// Twice-daily training nudge for customers with an active plan.
//
// Triggered from outside by a scheduler hitting this URL with the shared secret
// (see scripts/send-reminders.js and the PM2 entry in ecosystem.config.js).
// It is a route rather than an in-process timer because a timer inside the Next
// server would fire once per PM2 instance, and silently stop after a restart.
//
// Only customers who still have access get one — a reminder to train from a plan
// you no longer have is just noise.

export const dynamic = "force-dynamic";

// Rotated so the same person does not read the same sentence every day. Plain
// words only — no emoji — per the iOS notification style the app uses.
const MORNING = [
  { title: "اتمرنت النهارده؟", body: "جدولك جاهز ومحفوظ على موبايلك — افتحه وابدأ." },
  { title: "يوم جديد، تمرينة جديدة", body: "خطوة النهارده هي اللي بتفرق بكرة. الجدول مستنيك." },
  { title: "جاهز للتمرين؟", body: "افتح الجدول وشوف تمرينة النهارده قبل ما تنزل الجيم." },
];
const EVENING = [
  { title: "لسه ما اتمرنتش؟", body: "لسه فيه وقت. افتح الجدول وخلّص تمرينة النهارده." },
  { title: "خلّصت تمرين النهارده؟", body: "الاستمرارية هي السر. لو لسه، الجدول جاهز." },
  { title: "متنساش تمرينك", body: "حتى تمرينة قصيرة أحسن من ولا حاجة. الجدول معاك." },
];

function secretMatches(provided: string): boolean {
  const expected = process.env.CRON_SECRET || "";
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const provided = req.headers.get("x-cron-secret") || "";
  if (!secretMatches(provided)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slot = req.nextUrl.searchParams.get("slot") === "evening" ? "evening" : "morning";
  const pool = slot === "evening" ? EVENING : MORNING;
  const message = pool[new Date().getDate() % pool.length];

  // Only the ids of customers with a current plan AND a push subscription —
  // no point loading everyone else.
  const now = new Date();
  const rows = await db.pushSubscription.findMany({
    where: {
      role: "CUSTOMER",
      user: {
        entitlements: {
          some: {
            status: "ACTIVE",
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        },
      },
    },
    select: { userId: true },
    distinct: ["userId"],
    take: 20000,
  });

  const userIds = rows.map((r) => r.userId);
  const sent = userIds.length
    ? await notifyCustomers({ ...message, url: "/app/my-split", tag: `reminder-${slot}` }, userIds)
    : 0;

  return NextResponse.json({ ok: true, slot, recipients: userIds.length, sent });
}
