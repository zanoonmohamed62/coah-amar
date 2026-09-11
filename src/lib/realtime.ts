import { EventEmitter } from "events";
import Redis from "ioredis";

// Real-time push to the admin panel — new orders, payment screenshots, the live
// visitor count — with no polling.
//
// Why Server-Sent Events and not socket.io: the app is served by `next start`
// under PM2 (see ecosystem.config.js and .github/workflows/deploy.yml). Attaching
// socket.io needs a custom HTTP server, which means replacing `next start`, and
// that is a deploy-shaped change on the day of launch. Everything here flows in
// one direction — server to admin — which is exactly what SSE does natively over
// plain HTTP, through the same nginx/PM2 path the rest of the site already uses.
// It is a real push channel, not a poll.
//
// Redis carries the events so the panel keeps working if the app ever runs more
// than one PM2 instance (an order confirmed on worker A has to reach an admin
// connected to worker B). One shared subscriber connection fans out to every
// open admin stream in this process, rather than one Redis connection per tab.

export type RealtimeEvent =
  | { type: "order.created"; order: RealtimeOrder }
  | { type: "order.proof"; order: RealtimeOrder }
  | { type: "order.updated"; order: RealtimeOrder }
  | { type: "presence"; online: number };

export type RealtimeOrder = {
  orderRef: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
};

const CHANNEL = "amar:realtime";

const globalForBus = globalThis as unknown as {
  amarBus?: EventEmitter;
  amarSub?: Redis | null;
  amarPub?: Redis | null;
};

/** In-process fan-out. Every SSE stream in this worker listens here. */
export function bus(): EventEmitter {
  if (!globalForBus.amarBus) {
    const e = new EventEmitter();
    // An admin panel with several tabs open is normal; the default cap of 10
    // would print a spurious leak warning on the eleventh.
    e.setMaxListeners(0);
    globalForBus.amarBus = e;
  }
  return globalForBus.amarBus;
}

function redisUrl() {
  return process.env.REDIS_URL || "redis://127.0.0.1:6379";
}

// A connection in subscriber mode can't run ordinary commands, so publishing
// needs its own. Both are lazy: nothing connects until the first admin opens a
// stream or the first order lands.
function publisher(): Redis | null {
  if (globalForBus.amarPub === null) return null;
  if (!globalForBus.amarPub) {
    try {
      globalForBus.amarPub = new Redis(redisUrl(), {
        maxRetriesPerRequest: 2,
        lazyConnect: false,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 2000)),
      });
      globalForBus.amarPub.on("error", () => { /* handled by degrading below */ });
    } catch {
      globalForBus.amarPub = null;
    }
  }
  return globalForBus.amarPub ?? null;
}

/** Starts the shared subscriber once; safe to call on every stream open. */
export function ensureSubscriber(): void {
  if (globalForBus.amarSub !== undefined) return;
  try {
    const sub = new Redis(redisUrl(), {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 200, 5000),
    });
    sub.on("error", () => { /* reconnects on its own; local delivery still works */ });
    sub.subscribe(CHANNEL).catch(() => {});
    sub.on("message", (channel, raw) => {
      if (channel !== CHANNEL) return;
      try {
        bus().emit("event", JSON.parse(raw) as RealtimeEvent);
      } catch {
        /* malformed payload — drop it rather than tearing the stream down */
      }
    });
    globalForBus.amarSub = sub;
  } catch {
    globalForBus.amarSub = null;
  }
}

/**
 * Fire an event at every connected admin.
 *
 * Never throws and never blocks the caller: an order must still be created if
 * Redis is unreachable. With Redis down the event is still delivered inside
 * this worker, which is the whole story on a single-instance deploy.
 */
export function publishEvent(event: RealtimeEvent): void {
  const pub = publisher();
  if (pub) {
    pub.publish(CHANNEL, JSON.stringify(event)).catch(() => {
      bus().emit("event", event);
    });
    // With Redis up, the subscriber above delivers it back to this worker too,
    // so emitting here as well would double it. The catch covers the other case.
    return;
  }
  bus().emit("event", event);
}
