import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "../redis/client";
import { checkRateLimit, type RateLimitResult } from "./rate-limit";

const limiters = new Map<string, Ratelimit>();

function limiterFor(maxRequests: number, windowMs: number): Ratelimit | null {
  const r = getRedis();
  if (!r) return null;

  const windowSec = Math.max(1, Math.round(windowMs / 1000));
  const cacheKey = `${maxRequests}:${windowSec}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
      prefix: `driveely:rl:${cacheKey}`,
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/** Rate limit distribué Redis avec fallback RAM si indisponible. */
export async function checkRateLimitDistributed(
  key: string,
  maxRequests: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const limiter = limiterFor(maxRequests, windowMs);
  if (!limiter) {
    return checkRateLimit(key, maxRequests, windowMs);
  }

  try {
    const res = await limiter.limit(key);
    return {
      allowed: res.success,
      remaining: res.remaining,
      resetAt: res.reset,
    };
  } catch (e) {
    console.warn("[driveely/ratelimit] redis fallback", e);
    return checkRateLimit(key, maxRequests, windowMs);
  }
}
