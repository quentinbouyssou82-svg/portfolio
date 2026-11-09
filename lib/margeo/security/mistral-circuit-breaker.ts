/**
 * Circuit breaker applicatif Mistral — plafond d'appels sur 24 h glissantes.
 * Redis (Upstash) si configuré, sinon fallback RAM par instance.
 */

import { getRedis } from "@/lib/margeo/redis/client";
import { parseEnforcementMode, type SecurityEnforcementMode } from "./enforcement-mode";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const REDIS_KEY = "driveely:mistral:calls:24h";
const callTimestamps: number[] = [];

export type MistralCircuitBreakerConfig = {
  /** 0 = désactivé */
  dailyLimit: number;
  mode: SecurityEnforcementMode;
};

export function getMistralCircuitBreakerConfig(): MistralCircuitBreakerConfig {
  const rawLimit = process.env.MISTRAL_DAILY_CALL_LIMIT?.trim();
  const dailyLimit = rawLimit ? Math.max(0, parseInt(rawLimit, 10) || 0) : 0;
  return {
    dailyLimit,
    mode: parseEnforcementMode(
      process.env.MISTRAL_CIRCUIT_BREAKER_MODE,
      "log_only",
    ),
  };
}

function pruneOld(now: number): void {
  const cutoff = now - WINDOW_MS;
  while (callTimestamps.length > 0 && callTimestamps[0]! < cutoff) {
    callTimestamps.shift();
  }
}

/** Enregistre un appel Mistral Vision (à appeler juste avant l'HTTP). */
export function recordMistralCall(): void {
  pruneOld(Date.now());
  callTimestamps.push(Date.now());
  const redis = getRedis();
  if (redis) {
    void redis
      .pipeline()
      .incr(REDIS_KEY)
      .expire(REDIS_KEY, Math.ceil(WINDOW_MS / 1000))
      .exec()
      .catch((e) => console.warn("[driveely/security] mistral_counter_redis", e));
  }
}

export type MistralCircuitBreakerStatus = {
  tripped: boolean;
  count24h: number;
  limit: number;
  mode: SecurityEnforcementMode;
  shouldBlock: boolean;
};

export function evaluateMistralCircuitBreaker(
  now = Date.now(),
): MistralCircuitBreakerStatus {
  const config = getMistralCircuitBreakerConfig();
  pruneOld(now);
  const count24h = callTimestamps.length;
  const tripped =
    config.dailyLimit > 0 && count24h >= config.dailyLimit;
  const shouldBlock = tripped && config.mode === "strict";

  if (tripped) {
    console.warn("[driveely/security] mistral_circuit_breaker", {
      count24h,
      limit: config.dailyLimit,
      mode: config.mode,
      shouldBlock,
    });
  }

  return {
    tripped,
    count24h,
    limit: config.dailyLimit,
    mode: config.mode,
    shouldBlock,
  };
}

/** Version async qui lit le compteur Redis si disponible. */
export async function evaluateMistralCircuitBreakerAsync(): Promise<MistralCircuitBreakerStatus> {
  const config = getMistralCircuitBreakerConfig();
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<number | string>(REDIS_KEY);
      const count24h = Number(raw ?? 0) || 0;
      const tripped =
        config.dailyLimit > 0 && count24h >= config.dailyLimit;
      const shouldBlock = tripped && config.mode === "strict";
      if (tripped) {
        console.warn("[driveely/security] mistral_circuit_breaker", {
          count24h,
          limit: config.dailyLimit,
          mode: config.mode,
          shouldBlock,
          source: "redis",
        });
      }
      return {
        tripped,
        count24h,
        limit: config.dailyLimit,
        mode: config.mode,
        shouldBlock,
      };
    } catch (e) {
      console.warn("[driveely/security] mistral_breaker_redis_fallback", e);
    }
  }
  return evaluateMistralCircuitBreaker();
}
