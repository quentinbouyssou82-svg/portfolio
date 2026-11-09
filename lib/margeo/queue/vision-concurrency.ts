import { getRedis } from "../redis/client";

const SLOT_KEY = "driveely:vision:slots";
const MAX_SLOTS = Number(process.env.DRIVEELY_VISION_MAX_CONCURRENT ?? "50");
const WAIT_MS = Number(process.env.DRIVEELY_VISION_SLOT_WAIT_MS ?? "800");
const SLOT_TTL_SEC = 20;

/** Sémaphore Redis — limite appels Vision simultanés. */
export async function acquireVisionSlot(): Promise<{ acquired: boolean; waitedMs: number }> {
  const redis = getRedis();
  if (!redis) return { acquired: true, waitedMs: 0 };

  const started = Date.now();
  const deadline = started + WAIT_MS;

  while (Date.now() < deadline) {
    try {
      const current = await redis.incr(SLOT_KEY);
      // TTL court : un compteur fantôme expire vite (crash mid-flight).
      await redis.expire(SLOT_KEY, SLOT_TTL_SEC);
      if (current <= MAX_SLOTS) {
        return { acquired: true, waitedMs: Date.now() - started };
      }
      await redis.decr(SLOT_KEY);
      // Compteur aberrant (crashs) → reset soft pour ne pas bloquer prod.
      if (current > MAX_SLOTS * 3) {
        await redis.set(SLOT_KEY, Math.max(0, MAX_SLOTS - 1), { ex: SLOT_TTL_SEC });
        return { acquired: true, waitedMs: Date.now() - started };
      }
    } catch (e) {
      console.warn("[driveely/vision-queue] slot acquire fallback", e);
      return { acquired: true, waitedMs: 0 };
    }
    await new Promise((r) => setTimeout(r, 40));
  }

  // Fail-open : mieux servir une analyse qu'un faux « saturé » (slots fantômes).
  console.warn("[driveely/vision-queue] slot wait exceeded — fail open");
  return { acquired: true, waitedMs: Date.now() - started };
}

export async function releaseVisionSlot(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  try {
    const v = await redis.decr(SLOT_KEY);
    if (v < 0) await redis.set(SLOT_KEY, 0, { ex: SLOT_TTL_SEC });
  } catch {
    /* ignore */
  }
}
