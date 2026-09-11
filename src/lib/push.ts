import webpush from "web-push";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

// Web Push — the Shopify-style order alert on the admin's phone, and the
// training nudges customers get twice a day.
//
// Entirely optional at runtime: with no VAPID keys configured every function
// here no-ops and returns 0. Nothing in checkout or the admin panel depends on
// a push actually being delivered.
//
// Generate a key pair once and put it in .env.local on the VPS:
//   npx web-push generate-vapid-keys
//   VAPID_PUBLIC_KEY=...          (also NEXT_PUBLIC_VAPID_PUBLIC_KEY, same value)
//   VAPID_PRIVATE_KEY=...
//   VAPID_SUBJECT=mailto:you@example.com

let configured: boolean | null = null;

export function pushConfigured(): boolean {
  if (configured !== null) return configured;
  const pub = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    configured = false;
    return false;
  }
  try {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:support@amarfitness.com", pub, priv);
    configured = true;
  } catch {
    configured = false;
  }
  return configured;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

/**
 * Send to every subscription matching `where`.
 *
 * A 404/410 means the browser threw the subscription away (app deleted,
 * notifications revoked). Those rows are deleted rather than retried on every
 * future broadcast, which is what otherwise turns a dead phone into a slow
 * outbound queue for everyone else.
 */
async function send(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where: any,
  payload: PushPayload
): Promise<number> {
  if (!pushConfigured()) return 0;

  const subs = await db.pushSubscription.findMany({ where, take: 5000 });
  if (subs.length === 0) return 0;

  const body = JSON.stringify(payload);
  const dead: string[] = [];
  let sent = 0;

  // Batched rather than all at once, so a few thousand customer reminders can't
  // open a few thousand outbound sockets in one tick.
  const BATCH = 50;
  for (let i = 0; i < subs.length; i += BATCH) {
    await Promise.all(
      subs.slice(i, i + BATCH).map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            body,
            { TTL: 3600 }
          );
          sent++;
        } catch (err) {
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) dead.push(s.id);
        }
      })
    );
  }

  if (dead.length) {
    await db.pushSubscription.deleteMany({ where: { id: { in: dead } } }).catch(() => {});
  }
  return sent;
}

/** Order alerts for the admin's installed app. */
export function notifyAdmins(payload: PushPayload): Promise<number> {
  return send({ role: Role.ADMIN }, payload).catch(() => 0);
}

/** Training nudges for entitled customers. */
export function notifyCustomers(payload: PushPayload, userIds?: string[]): Promise<number> {
  return send(
    { role: Role.CUSTOMER, ...(userIds ? { userId: { in: userIds } } : {}) },
    payload
  ).catch(() => 0);
}

export function notifyUser(userId: string, payload: PushPayload): Promise<number> {
  return send({ userId }, payload).catch(() => 0);
}
