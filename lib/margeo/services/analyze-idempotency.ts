/**
 * Idempotence analyse — évite doublons score / quota / historique quand le client
 * timeout puis retry alors que le serveur a déjà persisté.
 *
 * Clé : userId + contentHash (JPEG préparé). TTL court (10 min).
 */

import { getRedis } from "../redis/client";
import type { RideAnalysis } from "../types";
import type { ScreenshotAnalysisResult } from "../analyze-screenshot";
import type { QuotaStatus } from "./quota";

const TTL_SEC = 10 * 60;
const REDIS_PREFIX = "driveely:analyze:idem:";
const MAX_RAM = 100;

export type AnalyzeSuccessPayload = {
  analysis: RideAnalysis;
  source: ScreenshotAnalysisResult["source"];
  confidence: number;
  warnings: string[];
  missingFields: string[];
  extractionQuality: ScreenshotAnalysisResult["extractionQuality"];
  extractionFields: ScreenshotAnalysisResult["fields"];
  reliability: RideAnalysis["reliability"];
  fromCache: boolean;
  quota: {
    premium: boolean;
    remainingToday: number | null;
    dailyLimit: number | null;
  };
  timings: Record<string, number>;
  /** Marqueur pour logs / client */
  idempotentReplay?: boolean;
};

type RamEntry = { payload: AnalyzeSuccessPayload; expires: number };
const ramStore = new Map<string, RamEntry>();

function key(userId: string, contentHash: string): string {
  return `${userId}:${contentHash}`;
}

function pruneRam() {
  if (ramStore.size < MAX_RAM) return;
  const now = Date.now();
  for (const [k, v] of ramStore) {
    if (v.expires <= now) ramStore.delete(k);
  }
  while (ramStore.size >= MAX_RAM) {
    const first = ramStore.keys().next().value;
    if (!first) break;
    ramStore.delete(first);
  }
}

export async function getAnalyzeIdempotentResponse(
  userId: string,
  contentHash: string,
): Promise<AnalyzeSuccessPayload | null> {
  const k = key(userId, contentHash);
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<string>(`${REDIS_PREFIX}${k}`);
      if (raw) {
        const parsed =
          typeof raw === "string"
            ? (JSON.parse(raw) as AnalyzeSuccessPayload)
            : (raw as AnalyzeSuccessPayload);
        return { ...parsed, idempotentReplay: true, fromCache: true };
      }
    } catch (e) {
      console.warn("[driveely/analyze-idempotency] redis get fallback", e);
    }
  }

  const ram = ramStore.get(k);
  if (!ram) return null;
  if (Date.now() > ram.expires) {
    ramStore.delete(k);
    return null;
  }
  return { ...ram.payload, idempotentReplay: true, fromCache: true };
}

export async function setAnalyzeIdempotentResponse(
  userId: string,
  contentHash: string,
  payload: AnalyzeSuccessPayload,
): Promise<void> {
  const k = key(userId, contentHash);
  const toStore: AnalyzeSuccessPayload = {
    ...payload,
    idempotentReplay: false,
  };
  pruneRam();
  ramStore.set(k, { payload: toStore, expires: Date.now() + TTL_SEC * 1000 });

  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(`${REDIS_PREFIX}${k}`, JSON.stringify(toStore), {
      ex: TTL_SEC,
    });
  } catch (e) {
    console.warn("[driveely/analyze-idempotency] redis set fallback", e);
  }
}

/** Aide typage quota → payload JSON. */
export function quotaToPayload(quota: QuotaStatus): AnalyzeSuccessPayload["quota"] {
  return {
    premium: quota.premium,
    remainingToday: quota.remainingToday,
    dailyLimit: quota.dailyLimit,
  };
}
