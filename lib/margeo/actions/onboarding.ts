"use server";

import {
  DEFAULT_VEHICLE_COSTS,
  DRIVEELY_PATHS,
} from "@/lib/margeo/constants";
import { getAppFeatures } from "@/lib/margeo/config";
import type { MargeoActionResult } from "@/lib/margeo/auth/actions";
import { updateProfile } from "@/lib/margeo/services/profile";
import type { OnboardingInput } from "@/lib/margeo/supabase/schema";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";
import { markBetaTester } from "@/lib/margeo/services/beta-user";

function draftToPatch(input: Partial<OnboardingInput>): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  if (input.vehicle) {
    patch.vehicle = input.vehicle;
    patch.cost_per_km = DEFAULT_VEHICLE_COSTS[input.vehicle as keyof typeof DEFAULT_VEHICLE_COSTS] ?? 0.18;
  }
  if (input.targetHourly != null) patch.target_hourly = input.targetHourly;
  if (input.minBenefit != null) patch.min_benefit = input.minBenefit;
  if (input.maxDistanceKm != null) patch.max_distance_km = input.maxDistanceKm;
  if (input.emptyReturns) patch.empty_returns = input.emptyReturns;
  if (input.weeklyHours) patch.weekly_hours = input.weeklyHours;

  return patch;
}

/** Sauvegarde partielle des réponses onboarding (sans marquer terminé). */
export async function saveOnboardingProgressAction(
  input: Partial<OnboardingInput>,
): Promise<MargeoActionResult> {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Non authentifié." };
  }

  const patch = draftToPatch(input);
  if (Object.keys(patch).length === 0) {
    return { ok: true };
  }

  const profile = await updateProfile(user.id, patch);
  if (!profile) {
    return { ok: false, message: "Impossible de sauvegarder." };
  }

  return { ok: true };
}

export async function completeOnboardingAction(
  input: OnboardingInput,
): Promise<MargeoActionResult> {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Non authentifié." };
  }

  if (!input.vehicle) {
    return { ok: false, message: "Choisis ton véhicule." };
  }
  if (!input.targetHourly || input.targetHourly < 5) {
    return { ok: false, message: "Objectif €/h invalide." };
  }
  if (!input.emptyReturns) {
    return { ok: false, message: "Indique ta préférence pour les retours à vide." };
  }
  if (!input.weeklyHours) {
    return { ok: false, message: "Indique ton volume horaire hebdomadaire." };
  }

  const profile = await updateProfile(user.id, {
    ...draftToPatch(input),
    onboarding_completed: true,
  });

  if (!profile) {
    return { ok: false, message: "Impossible de sauvegarder le profil." };
  }

  const { persistOnboardingCompletedMetadata } = await import(
    "@/lib/margeo/onboarding-repair"
  );
  await persistOnboardingCompletedMetadata(user.id);

  await markBetaTester(user.id);
  await logBetaEvent({
    userId: user.id,
    eventType: "onboarding_completed",
    metadata: {
      vehicle: input.vehicle,
      targetHourly: input.targetHourly,
      minBenefit: input.minBenefit,
      maxDistanceKm: input.maxDistanceKm,
      emptyReturns: input.emptyReturns,
      weeklyHours: input.weeklyHours,
    },
  });

  return {
    ok: true,
    redirectTo: getAppFeatures().postOnboardingPaywall
      ? `${DRIVEELY_PATHS.premium}?source=onboarding`
      : DRIVEELY_PATHS.dashboard,
  };
}

export async function completeOnboardingAndRedirect(
  input: OnboardingInput,
): Promise<MargeoActionResult> {
  return completeOnboardingAction(input);
}
