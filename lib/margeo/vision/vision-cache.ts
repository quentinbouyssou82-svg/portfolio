/**
 * Cache mémoire court pour résultats Vision (mêmes captures / campagnes QA).
 * TTL 10 min, max 200 entrées.
 */

import type { ScreenshotAnalysisResult } from "../analyze-screenshot";

const TTL_MS = 10 * 60_000;
const MAX = 200;

type Entry = { result: ScreenshotAnalysisResult; expires: number };

const store = new Map<string, Entry>();

export function getVisionCache(hash: string): ScreenshotAnalysisResult | null {
  const e = store.get(hash);
  if (!e) return null;
  if (Date.now() > e.expires) {
    store.delete(hash);
    return null;
  }
  return {
    ...e.result,
    offer: { ...e.result.offer, id: crypto.randomUUID() },
  };
}

export function setVisionCache(
  hash: string,
  result: ScreenshotAnalysisResult,
): void {
  if (store.size >= MAX) {
    const first = store.keys().next().value;
    if (first) store.delete(first);
  }
  store.set(hash, {
    result: {
      ...result,
      // Ne pas stocker d'id unique — régénéré à la lecture
      offer: { ...result.offer },
    },
    expires: Date.now() + TTL_MS,
  });
}
