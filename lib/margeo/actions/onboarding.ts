"use server";

import { redirect } from "next/navigation";
import {
  DEFAULT_VEHICLE_COSTS,
  UBERLY_PATHS,
} from "@/lib/margeo/constants";
import type { MargeoActionResult } from "@/lib/margeo/auth/actions";
import { updateProfile } from "@/lib/margeo/services/profile";
import type { OnboardingInput } from "@/lib/margeo/supabase/schema";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";
import { markBetaTester } from "@/lib/margeo/services/beta-user";

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

  if (!input.name?.trim()) {
    return { ok: false, message: "Le prénom est requis." };
  }
  if (!input.city?.trim()) {
    return { ok: false, message: "La ville est requise." };
  }
  if (!input.platforms?.length) {
    return { ok: false, message: "Sélectionne au moins une plateforme." };
  }
  if (!input.targetHourly || input.targetHourly < 5) {
    return { ok: false, message: "Objectif €/h invalide." };
  }

  const costPerKm =
    input.costPerKm ?? DEFAULT_VEHICLE_COSTS[input.vehicle] ?? 0.24;

  const profile = await updateProfile(user.id, {
    name: input.name.trim(),
    city: input.city.trim(),
    vehicle: input.vehicle,
    platforms: input.platforms,
    other_platform: input.otherPlatform?.trim() || null,
    target_hourly: input.targetHourly,
    daily_target: input.dailyTarget ?? 90,
    cost_per_km: costPerKm,
    onboarding_completed: true,
  });

  if (!profile) {
    return { ok: false, message: "Impossible de sauvegarder le profil." };
  }

  await markBetaTester(user.id);
  await logBetaEvent({
    userId: user.id,
    eventType: "onboarding_completed",
    metadata: {
      city: input.city,
      vehicle: input.vehicle,
      platforms: input.platforms.join(","),
    },
  });

  return { ok: true };
}

export async function completeOnboardingAndRedirect(
  input: OnboardingInput,
): Promise<MargeoActionResult> {
  const result = await completeOnboardingAction(input);
  if (result.ok) {
    redirect(UBERLY_PATHS.dashboard);
  }
  return result;
}
