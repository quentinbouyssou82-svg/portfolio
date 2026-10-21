import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "../redis/client";
import { checkRateLimit, type RateLimitResult } from "./rate-limit";

const GLOBAL_KEY = "global:analyze";
const DEFAULT_MAX = Number(process.env.DRIVEELY_GLOBAL_ANALYZE_PER_MIN ?? "500");
const WINDOW_MS = 60_000;

let globalLimiter: Ratelimit | null | undefined;

function getGlobalLimiter(): Ratelimit | null {
  if (globalLimiter !== undefined) return globalLimiter;
  const r = getRedis();
  if (!r) {
    globalLimiter = null;
    return null;
  }
  globalLimiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(DEFAULT_MAX, "1 m"),
    prefix: "driveely:global",
  });
  return globalLimiter;
}

/** Coupe-circuit anti-abus — toutes routes analyze confondues. */
export async function checkGlobalAnalyzeLimit(): Promise<RateLimitResult> {
  const limiter = getGlobalLimiter();
  if (!limiter) {
    return checkRateLimit(GLOBAL_KEY, DEFAULT_MAX, WINDOW_MS);
  }

  try {
    const res = await limiter.limit(GLOBAL_KEY);
    return {
      allowed: res.success,
      remaining: res.remaining,
      resetAt: res.reset,
    };
  } catch (e) {
    console.warn("[driveely/ratelimit] global redis fallback", e);
    return checkRateLimit(GLOBAL_KEY, DEFAULT_MAX, WINDOW_MS);
  }
}
