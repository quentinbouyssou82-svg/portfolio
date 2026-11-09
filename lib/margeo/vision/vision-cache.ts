/**
 * Cache Vision — Redis partagé (Upstash) + fallback RAM par instance.
 */

import type { ScreenshotAnalysisResult } from "../analyze-screenshot";
import { getRedis } from "../redis/client";

const TTL_MS = 10 * 60_000;
const TTL_SEC = Math.ceil(TTL_MS / 1000);
const MAX = 200;
const REDIS_PREFIX = "driveely:vision:";

type Entry = { result: ScreenshotAnalysisResult; expires: number };
const ramStore = new Map<string, Entry>();

function cloneResult(result: ScreenshotAnalysisResult): ScreenshotAnalysisResult {
  return {
    ...result,
    offer: { ...result.offer, id: crypto.randomUUID() },
  };
}

export function getVisionCache(hash: string): ScreenshotAnalysisResult | null {
  const e = ramStore.get(hash);
  if (!e) return null;
  if (Date.now() > e.expires) {
    ramStore.delete(hash);
    return null;
  }
  return cloneResult(e.result);
}

export async function getVisionCacheAsync(
  hash: string,
): Promise<ScreenshotAnalysisResult | null> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<string>(`${REDIS_PREFIX}${hash}`);
      if (raw) {
        const parsed =
          typeof raw === "string"
            ? (JSON.parse(raw) as ScreenshotAnalysisResult)
            : (raw as ScreenshotAnalysisResult);
        return cloneResult(parsed);
      }
    } catch (e) {
      console.warn("[driveely/vision-cache] redis get fallback", e);
    }
  }
  return getVisionCache(hash);
}

export function setVisionCache(
  hash: string,
  result: ScreenshotAnalysisResult,
): void {
  if (ramStore.size >= MAX) {
    const first = ramStore.keys().next().value;
    if (first) ramStore.delete(first);
  }
  ramStore.set(hash, {
    result: { ...result, offer: { ...result.offer } },
    expires: Date.now() + TTL_MS,
  });
}

export async function setVisionCacheAsync(
  hash: string,
  result: ScreenshotAnalysisResult,
): Promise<void> {
  setVisionCache(hash, result);
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(`${REDIS_PREFIX}${hash}`, JSON.stringify(result), {
      ex: TTL_SEC,
    });
  } catch (e) {
    console.warn("[driveely/vision-cache] redis set fallback", e);
  }
}

export function visionCacheStats(): { ramEntries: number; redis: boolean } {
  return { ramEntries: ramStore.size, redis: getRedis() != null };
}
