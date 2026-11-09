import { DRIVEELY_LIMITS } from "../constants/limits";
import { ApiError } from "../api/errors";
import { createMargeoServerClient } from "../supabase/server";
import {
  buildQuotaStatus,
  isQuotaExceeded,
} from "./quota-logic";
import { getRedis } from "../redis/client";
import { getUserEntitlements } from "./subscription";

export interface QuotaStatus {
  premium: boolean;
  planId: string;
  dailyLimit: number | null;
  usedToday: number;
  remainingToday: number | null;
}

function startOfUtcDay(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function countAnalysesToday(userId: string): Promise<number> {
  const supabase = await createMargeoServerClient();
  const since = startOfUtcDay();

  const { count, error } = await supabase
    .from("margeo_analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("analyzed_at", since);

  if (error) {
    console.error("[driveely/quota] count failed:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const entitlements = await getUserEntitlements(userId);
  const usedToday = await countAnalysesToday(userId);
  const unlimited = entitlements.canUnlimitedAnalysis;
  const dailyLimit =
    entitlements.dailyAnalysisLimit ?? DRIVEELY_LIMITS.freeDailyAnalyses;
  const base = buildQuotaStatus(unlimited, usedToday, dailyLimit);
  return {
    ...base,
    planId: entitlements.planId,
  };
}

/** Lance une erreur 429 si quota journalier dépassé. */
export async function assertAnalysisQuota(userId: string): Promise<QuotaStatus> {
  const entitlements = await getUserEntitlements(userId);
  if (!entitlements.canAnalyze) {
    throw new ApiError(
      "Ton plan ne permet pas d'analyser de courses.",
      403,
      "PLAN_FORBIDDEN",
    );
  }

  const unlimited = entitlements.canUnlimitedAnalysis;
  const dailyLimit =
    entitlements.dailyAnalysisLimit ?? DRIVEELY_LIMITS.freeDailyAnalyses;

  // Premium / illimité : pas besoin de compter les analyses du jour
  if (unlimited) {
    return {
      premium: true,
      planId: entitlements.planId,
      dailyLimit: null,
      usedToday: 0,
      remainingToday: null,
    };
  }

  const usedToday = await countAnalysesToday(userId);
  const base = buildQuotaStatus(false, usedToday, dailyLimit);

  if (isQuotaExceeded(usedToday, dailyLimit, false)) {
    throw new ApiError(
      `Limite Découverte atteinte : ${dailyLimit} analyses / jour. Passe en Pro pour des analyses illimitées.`,
      429,
      "DAILY_LIMIT_REACHED",
    );
  }

  return {
    ...base,
    planId: entitlements.planId,
  };
}

export interface DailyAnalysisSlot {
  release: () => Promise<void>;
}

const SLOT_TTL_SECONDS = 60 * 60 * 26;

/**
 * Réserve atomiquement un emplacement d'analyse du jour (plan gratuit).
 * Corrige le dépassement de quota quand plusieurs requêtes arrivent en même temps :
 * la vérification en base (count puis insert) n'est pas atomique, Redis INCR l'est.
 *
 * - Retourne `null` si Redis n'est pas configuré : la vérification en base reste la seule garde.
 * - Libérer l'emplacement (`release`) si l'analyse échoue.
 */
export async function reserveDailyAnalysisSlot(
  userId: string,
  dailyLimit: number,
): Promise<DailyAnalysisSlot | null> {
  const redis = getRedis();
  if (!redis) return null;

  const day = new Date().toISOString().slice(0, 10);
  const key = `driveely:quota:${userId}:${day}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, SLOT_TTL_SECONDS);
  }

  let released = false;
  const release = async () => {
    if (released) return;
    released = true;
    try {
      await redis.decr(key);
    } catch (error) {
      console.warn("[driveely/quota] release slot failed", error);
    }
  };

  if (count > dailyLimit) {
    await release();
    throw new ApiError(
      `Limite Découverte atteinte : ${dailyLimit} analyses / jour. Passe en Pro pour des analyses illimitées.`,
      429,
      "DAILY_LIMIT_REACHED",
    );
  }

  return { release };
}

export async function getHistoryCutoffIsoForUser(
  userId: string,
): Promise<string | null> {
  const entitlements = await getUserEntitlements(userId);
  if (entitlements.canUnlimitedHistory || entitlements.historyDays == null) {
    return null;
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - entitlements.historyDays);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff.toISOString();
}

/** @deprecated Préférer getHistoryCutoffIsoForUser */
export function getFreeHistoryCutoffIso(
  profile: {
    premium?: boolean;
    premiumUntil?: string;
    premiumSource?: string;
    planId?: string;
  } | null,
): string | null {
  if (!profile) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - DRIVEELY_LIMITS.freeHistoryDays);
    cutoff.setHours(0, 0, 0, 0);
    return cutoff.toISOString();
  }
  const plan = profile.planId ?? (profile.premium ? "pro" : "discovery");
  if (plan === "pro" || plan === "elite" || profile.premium) {
    if (profile.premiumUntil) {
      const expires = new Date(profile.premiumUntil);
      if (expires.getTime() < Date.now()) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - DRIVEELY_LIMITS.freeHistoryDays);
        cutoff.setHours(0, 0, 0, 0);
        return cutoff.toISOString();
      }
    }
    return null;
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - DRIVEELY_LIMITS.freeHistoryDays);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff.toISOString();
}
