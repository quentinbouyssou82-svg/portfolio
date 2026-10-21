/**
 * Réparation onboarding — Node only (service role), pas pour le middleware Edge.
 */

import type { User } from "@supabase/supabase-js";
import { getMargeoAdminDb } from "@/lib/margeo/supabase/admin";
import {
  metadataOnboardingCompleted,
  needsOnboardingRepair,
  type OnboardingProfileSignal,
} from "@/lib/margeo/onboarding-status";

export async function persistOnboardingCompletedMetadata(
  userId: string,
): Promise<void> {
  try {
    const admin = getMargeoAdminDb();
    const { data } = await admin.auth.admin.getUserById(userId);
    const current = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
    if (metadataOnboardingCompleted(data.user)) return;
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...current,
        onboarding_completed: true,
      },
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[driveely/onboarding] metadata backup failed:", e);
    }
  }
}

/**
 * iOS questionnaire marks the funnel complete locally, then persists the
 * profile in the background. Analyze used to 403 ONBOARDING_REQUIRED in that
 * window (152 prod failures). Fill the same defaults as iOS and mark complete.
 */
export async function ensureProfileReadyForAnalyze(
  userId: string,
  row: OnboardingProfileSignal,
  user?: User | null,
): Promise<"complete" | "incomplete"> {
  const repaired = await repairOnboardingCompletedIfNeeded(userId, row, user);
  if (repaired || row.onboarding_completed === true) {
    return "complete";
  }

  try {
    const admin = getMargeoAdminDb();
    const patch: Record<string, unknown> = {
      onboarding_completed: true,
    };
    const vehicle =
      typeof row.vehicle === "string" ? row.vehicle.trim() : "";
    if (!vehicle) {
      patch.vehicle = "scooter_thermique";
    }
    const target =
      row.target_hourly == null ? 0 : Number(row.target_hourly);
    if (!(Number.isFinite(target) && target >= 5)) {
      patch.target_hourly = 16;
    }
    const empty =
      typeof row.empty_returns === "string" ? row.empty_returns.trim() : "";
    if (!empty) {
      patch.empty_returns = "short_only";
    }
    const weekly =
      typeof row.weekly_hours === "string" ? row.weekly_hours.trim() : "";
    if (!weekly) {
      patch.weekly_hours = "20_30";
    }

    const { error } = await admin
      .from("margeo_profiles")
      .update(patch)
      .eq("id", userId);
    if (error) {
      console.warn(
        "[driveely/onboarding] analyze-ready patch failed:",
        error.message,
      );
      return "incomplete";
    }
    await persistOnboardingCompletedMetadata(userId);
    return "complete";
  } catch (e) {
    console.warn("[driveely/onboarding] analyze-ready exception:", e);
    return "incomplete";
  }
}

/** Répare DB + metadata si le statut résolu est complete mais le flag DB est faux. */
export async function repairOnboardingCompletedIfNeeded(
  userId: string,
  row: OnboardingProfileSignal | null | undefined,
  user?: User | null,
): Promise<boolean> {
  const shouldRepair =
    needsOnboardingRepair(row, user) ||
    (metadataOnboardingCompleted(user) &&
      !(row && row.onboarding_completed === true));

  if (!shouldRepair) {
    if (row?.onboarding_completed === true) {
      void persistOnboardingCompletedMetadata(userId);
    }
    return false;
  }

  try {
    const admin = getMargeoAdminDb();
    const { error } = await admin
      .from("margeo_profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);
    if (error) {
      console.warn("[driveely/onboarding] repair failed:", error.message);
      return false;
    }
    await persistOnboardingCompletedMetadata(userId);
    return true;
  } catch (e) {
    console.warn("[driveely/onboarding] repair exception:", e);
    return false;
  }
}
