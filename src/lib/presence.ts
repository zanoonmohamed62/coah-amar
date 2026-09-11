import { redis } from "@/lib/redis";

// Live visitor count for the admin dashboard.
//
// Every open page sends one small beacon every 60s (see VisitorBeacon). Each
// beacon writes one member into a Redis sorted set scored by the current time;
// "online now" is simply how many members were seen in the last 130 seconds —
// two beacon intervals plus slack, so one delayed ping doesn't drop a visitor.
// Stale members are trimmed on every read, so the set never grows past the
// people actually on the site.
//
// This is deliberately not one long-lived connection per visitor: ten thousand
// simultaneous visitors would be ten thousand open sockets against a single
// Node process capped at 512 MB (ecosystem.config.js). A beacon costs one Redis
// write per visitor per 30 seconds and holds nothing open.

const KEY = "amar:presence";
const WINDOW_MS = 130_000;

// Used only when Redis is unreachable, so the counter degrades to "this worker's
// view" instead of breaking the dashboard.
const globalForPresence = globalThis as unknown as { amarPresence?: Map<string, number> };
function localMap(): Map<string, number> {
  if (!globalForPresence.amarPresence) globalForPresence.amarPresence = new Map();
  return globalForPresence.amarPresence;
}

function pruneLocal(now: number) {
  const m = localMap();
  for (const [k, t] of m) if (now - t > WINDOW_MS) m.delete(k);
}

/** Record that `visitorId` is on the site right now. */
export async function touchVisitor(visitorId: string): Promise<void> {
  const now = Date.now();
  try {
    await redis
      .multi()
      .zadd(KEY, now, visitorId)
      .zremrangebyscore(KEY, 0, now - WINDOW_MS)
      // Safety net: if every visitor leaves and nothing reads the key again,
      // it should not sit in Redis forever.
      .expire(KEY, 300)
      .exec();
  } catch {
    pruneLocal(now);
    localMap().set(visitorId, now);
  }
}

/** How many distinct visitors have checked in inside the window. */
export async function countOnline(): Promise<number> {
  const now = Date.now();
  try {
    await redis.zremrangebyscore(KEY, 0, now - WINDOW_MS);
    const n = await redis.zcard(KEY);
    return typeof n === "number" ? n : 0;
  } catch {
    pruneLocal(now);
    return localMap().size;
  }
}
