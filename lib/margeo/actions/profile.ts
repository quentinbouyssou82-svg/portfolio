"use server";

import type { MargeoActionResult } from "@/lib/margeo/auth/actions";
import {
  buildDisplayName,
  updateProfile,
} from "@/lib/margeo/services/profile";
import { uploadAvatar } from "@/lib/margeo/services/storage";
import type { UserProfile } from "@/lib/margeo/types";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";
import { UBERLY_LIMITS } from "@/lib/margeo/constants/limits";

const AVATAR_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_AVATAR_BYTES = Math.min(UBERLY_LIMITS.maxImageBytes, 5 * 1024 * 1024);

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

  const firstName = (input.firstName ?? input.name ?? "").trim();
  const lastName = (input.lastName ?? "").trim();
  const displayName = buildDisplayName(firstName, lastName);

  if (!firstName) {
    return { ok: false, message: "Le prénom est requis." };
  }

  const profile = await updateProfile(user.id, {
    first_name: firstName,
    last_name: lastName,
    name: displayName || firstName,
    city: input.city,
    vehicle: input.vehicle,
    vehicle_details: input.vehicleDetails
      ? (input.vehicleDetails as unknown as Record<string, unknown>)
      : undefined,
    cost_per_km: input.costPerKm,
    target_hourly: input.targetHourly,
    daily_target: input.dailyTarget,
    platforms: input.platforms,
    min_benefit: input.minBenefit,
    max_distance_km: input.maxDistanceKm,
    ...(input.avatarUrl !== undefined
      ? { avatar_url: input.avatarUrl || null }
      : {}),
  });

  if (!profile) {
    return { ok: false, message: "Impossible de mettre à jour le profil." };
  }

  return { ok: true, data: profile };
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<MargeoActionResult<UserProfile>> {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Non authentifié." };
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choisis une photo." };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return {
      ok: false,
      message: "Photo trop lourde (max 5 Mo).",
    };
  }

  const mime = (file.type || "image/jpeg").toLowerCase();
  if (!AVATAR_MIME.has(mime)) {
    return { ok: false, message: "Format non supporté. JPEG, PNG ou WebP." };
  }

  const ext = EXT_BY_MIME[mime] ?? "jpg";
  const uploaded = await uploadAvatar(user.id, file, ext);
  if (!uploaded) {
    return {
      ok: false,
      message: "Upload impossible. Vérifie le bucket uberly-avatars.",
    };
  }

  const profile = await updateProfile(user.id, {
    avatar_url: uploaded.publicUrl,
  });

  if (!profile) {
    return { ok: false, message: "Photo uploadée, mais profil non mis à jour." };
  }

  return { ok: true, data: profile };
}

export async function removeAvatarAction(): Promise<
  MargeoActionResult<UserProfile>
> {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Non authentifié." };
  }

  const profile = await updateProfile(user.id, { avatar_url: null });
  if (!profile) {
    return { ok: false, message: "Impossible de retirer la photo." };
  }

  return { ok: true, data: profile };
}
