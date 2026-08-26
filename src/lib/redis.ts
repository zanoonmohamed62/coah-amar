import Redis from 'ioredis';

// Initialize Redis only once across hot reloads
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// Use REDIS_URL from env, fallback to localhost for VPS
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = globalForRedis.redis ?? new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    // Don't keep retrying forever if Redis is down, to avoid blocking Next.js
    if (times > 3) return null;
    return Math.min(times * 50, 2000);
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

/**
 * A simple caching wrapper for heavy database functions.
 * Use this to wrap Prisma calls that return largely static data.
 * 
 * @param key Unique cache key
 * @param fetcher Async function to fetch data if cache misses
 * @param ttl Time to live in seconds (default: 3600 - 1 hour)
 */
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (err) {
    console.error(`[Redis] Cache read error for key: ${key}`, err);
  }

  // Cache miss or error reading from Redis
  const data = await fetcher();

  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttl);
  } catch (err) {
    console.error(`[Redis] Cache write error for key: ${key}`, err);
  }

  return data;
}
