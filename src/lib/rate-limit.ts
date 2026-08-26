import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

/**
 * Simple Redis-based rate limiter.
 * @param key Unique identifier (e.g., IP address)
 * @param limit Max requests allowed
 * @param windowSeconds Time window in seconds
 */
export async function rateLimit(
  key: string,
  limit: number = 20,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const redisKey = `rl:${key}`;

  try {
    const current = await redis.incr(redisKey);
    if (current === 1) {
      await redis.expire(redisKey, windowSeconds);
    }
    const ttl = await redis.ttl(redisKey);
    const remaining = Math.max(0, limit - current);
    const reset = Date.now() + ttl * 1000;

    return { allowed: current <= limit, remaining, reset };
  } catch {
    // If Redis is down, allow the request (fail open)
    return { allowed: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }
}

/**
 * Get client IP from Next.js request headers (works behind Nginx proxy).
 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Rate limit response helper.
 */
export function rateLimitResponse(reset: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        "X-RateLimit-Reset": String(reset),
      },
    }
  );
}
