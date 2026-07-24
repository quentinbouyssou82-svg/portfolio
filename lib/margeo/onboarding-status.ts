/**
 * Statut onboarding — fonctions pures (safe Edge / middleware).
 *
 * Bug QA : un `select` profil null/erreur était traité comme
 * `onboarding_completed === false` → redirect analyse → onboarding + API 403.
 */

import type { User } from "@supabase/supabase-js";

export type OnboardingStatus = "complete" | "incomplete" | "unknown";

export type OnboardingProfileSignal = {
  onboarding_completed?: boolean | null;
  vehicle?: string | null;
  target_hourly?: number | null;
  empty_returns?: string | null;
  weekly_hours?: string | null;
};

function truthyCompleted(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function hasCompletionSignals(
  row: OnboardingProfileSignal | null | undefined,
): boolean {
  if (!row) return false;
  const vehicle = typeof row.vehicle === "string" ? row.vehicle.trim() : "";
  const empty =
    typeof row.empty_returns === "string" ? row.empty_returns.trim() : "";
  const weekly =
    typeof row.weekly_hours === "string" ? row.weekly_hours.trim() : "";
  const target = row.target_hourly == null ? 0 : Number(row.target_hourly);
  return Boolean(
    vehicle && empty && weekly && Number.isFinite(target) && target >= 5,
  );
}

export function metadataOnboardingCompleted(
  user: User | null | undefined,
): boolean {
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  return truthyCompleted(meta?.onboarding_completed);
}

/**
 * `unknown` = ne pas forcer le redirect onboarding (évite les faux positifs).
 */
export function resolveOnboardingStatus(
  row: OnboardingProfileSignal | null | undefined,
  user?: User | null,
  opts?: { profileReadError?: boolean },
): OnboardingStatus {
  if (opts?.profileReadError) return "unknown";

  if (row && truthyCompleted(row.onboarding_completed)) {
    return "complete";
  }

  if (metadataOnboardingCompleted(user)) {
    return "complete";
  }

  if (hasCompletionSignals(row)) {
    return "complete";
  }

  if (!row) return "unknown";

  return "incomplete";
}

export function needsOnboardingRepair(
  row: OnboardingProfileSignal | null | undefined,
  user?: User | null,
): boolean {
  if (!row) return false;
  if (truthyCompleted(row.onboarding_completed)) return false;
  return resolveOnboardingStatus(row, user) === "complete";
}
