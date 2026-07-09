import { UBERLY_LIMITS } from "../constants/limits";
import { ApiError } from "../api/errors";
import { createMargeoServerClient } from "../supabase/server";
import { getProfileForUser } from "./profile";
import { isUserPremium } from "./premium";
import {
  buildQuotaStatus,
  isQuotaExceeded,
} from "./quota-logic";

export interface QuotaStatus {
  premium: boolean;
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
    console.error("[uberly/quota] count failed:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const profile = await getProfileForUser(userId);
  const premium = profile ? isUserPremium(profile) : false;
  const usedToday = await countAnalysesToday(userId);
  return buildQuotaStatus(
    premium,
    usedToday,
    UBERLY_LIMITS.freeDailyAnalyses,
  );
}

/** Lance une erreur 429 si quota journalier dépassé (free tier). */
export async function assertAnalysisQuota(userId: string): Promise<QuotaStatus> {
  const quota = await getQuotaStatus(userId);

  if (
    isQuotaExceeded(
      quota.usedToday,
      UBERLY_LIMITS.freeDailyAnalyses,
      quota.premium,
    )
  ) {
    throw new ApiError(
      `Limite atteinte : ${quota.dailyLimit} analyses par jour. Passe en Premium pour des analyses illimitées.`,
      429,
      "DAILY_LIMIT_REACHED",
    );
  }

  return quota;
}

export function getFreeHistoryCutoffIso(
  profile: Pick<
    import("../types").UserProfile,
    "premium" | "premiumUntil" | "premiumSource"
  > | null,
): string | null {
  if (profile && isUserPremium(profile)) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - UBERLY_LIMITS.freeHistoryDays);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff.toISOString();
}
