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
