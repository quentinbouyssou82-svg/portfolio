"use server";

import type { MargeoActionResult } from "@/lib/margeo/auth/actions";
import { updateProfile } from "@/lib/margeo/services/profile";
import type { UserProfile } from "@/lib/margeo/types";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";

export async function updateProfileAction(
  input: Partial<UserProfile>,
): Promise<MargeoActionResult<UserProfile>> {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Non authentifié." };
  }

  const profile = await updateProfile(user.id, {
    name: input.name,
    city: input.city,
    vehicle: input.vehicle,
    cost_per_km: input.costPerKm,
    target_hourly: input.targetHourly,
    daily_target: input.dailyTarget,
    platforms: input.platforms,
  });

  if (!profile) {
    return { ok: false, message: "Impossible de mettre à jour le profil." };
  }

  return { ok: true, data: profile };
}
