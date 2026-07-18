import type { MargeoProfileRow, ProfileUpdateInput } from "../supabase/schema";
import type { UserProfile } from "../types";
import { createMargeoServerClient } from "../supabase/server";
import { buildDisplayName } from "../profile-display";
import { getMargeoAdminDb } from "../supabase/admin";

export { buildDisplayName, getProfileInitials } from "../profile-display";

type ProfileMeta = {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
};

function readMeta(meta: Record<string, unknown> | undefined): ProfileMeta {
  if (!meta) return {};
  return {
    first_name:
      typeof meta.first_name === "string" ? meta.first_name : undefined,
    last_name: typeof meta.last_name === "string" ? meta.last_name : undefined,
    avatar_url:
      typeof meta.avatar_url === "string" ? meta.avatar_url : undefined,
  };
}

export function rowToUserProfile(
  row: MargeoProfileRow,
  meta?: ProfileMeta,
): UserProfile {
  const firstName =
    (row.first_name ?? "").trim() ||
    (meta?.first_name ?? "").trim() ||
    (row.name ?? "").trim().split(/\s+/)[0] ||
    "";
  const lastName =
    (row.last_name ?? "").trim() || (meta?.last_name ?? "").trim();
  const displayName =
    buildDisplayName(firstName, lastName) || (row.name ?? "").trim();
  const avatarUrl = row.avatar_url ?? meta?.avatar_url ?? undefined;

  return {
    id: row.id,
    name: displayName,
    firstName,
    lastName,
    avatarUrl: avatarUrl || undefined,
    city: row.city,
    vehicle: row.vehicle,
    costPerKm: Number(row.cost_per_km),
    targetHourly: Number(row.target_hourly),
    dailyTarget: Number(row.daily_target),
    platforms: row.platforms as UserProfile["platforms"],
    otherPlatform: row.other_platform ?? undefined,
    premium: row.premium,
    premiumUntil: row.premium_until ?? undefined,
    premiumSource: row.premium_source ?? undefined,
    isBetaTester: row.is_beta_tester,
    onboardingCompleted: row.onboarding_completed,
    minBenefit: Number(row.min_benefit ?? 6),
    maxDistanceKm: Number(row.max_distance_km ?? 8),
    emptyReturns: row.empty_returns ?? undefined,
    weeklyHours: row.weekly_hours ?? undefined,
    lastLat: row.last_lat != null ? Number(row.last_lat) : undefined,
    lastLng: row.last_lng != null ? Number(row.last_lng) : undefined,
    locationPermission: row.location_permission,
  };
}

function isMissingColumnError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    msg.includes("first_name") ||
    msg.includes("last_name") ||
    msg.includes("avatar_url") ||
    msg.includes("schema cache") ||
    msg.includes("does not exist")
  );
}

async function syncAuthProfileMeta(
  userId: string,
  meta: ProfileMeta,
): Promise<void> {
  try {
    const admin = getMargeoAdminDb();
    const { data } = await admin.auth.admin.getUserById(userId);
    const current = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...current,
        ...(meta.first_name !== undefined
          ? { first_name: meta.first_name }
          : {}),
        ...(meta.last_name !== undefined ? { last_name: meta.last_name } : {}),
        ...(meta.avatar_url !== undefined
          ? { avatar_url: meta.avatar_url }
          : {}),
      },
    });
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[uberly/profile] auth metadata sync failed:", e);
    }
  }
}

export async function getProfileForUser(
  userId: string,
  meta?: ProfileMeta,
): Promise<UserProfile | null> {
  const supabase = await createMargeoServerClient();
  const { data, error } = await supabase
    .from("margeo_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToUserProfile(data as MargeoProfileRow, meta);
}

/**
 * Garantit un profil pour chaque utilisateur auth (fallback si trigger SQL absent).
 */
export async function ensureProfileForUser(
  userId: string,
  name?: string,
  meta?: ProfileMeta,
): Promise<UserProfile | null> {
  const existing = await getProfileForUser(userId, meta);
  if (existing) return existing;

  const trimmed = name?.trim() || meta?.first_name?.trim() || "";
  const supabase = await createMargeoServerClient();

  const fullPayload = {
    id: userId,
    name: trimmed,
    first_name: trimmed,
    last_name: meta?.last_name ?? "",
    avatar_url: meta?.avatar_url ?? null,
  };

  let { data, error } = await supabase
    .from("margeo_profiles")
    .insert(fullPayload)
    .select("*")
    .single();

  if (isMissingColumnError(error)) {
    const legacy = await supabase
      .from("margeo_profiles")
      .insert({ id: userId, name: trimmed })
      .select("*")
      .single();
    data = legacy.data;
    error = legacy.error;
  }

  if (error) {
    return getProfileForUser(userId, meta);
  }

  return rowToUserProfile(data as MargeoProfileRow, meta);
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createMargeoServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const meta = readMeta(user.user_metadata as Record<string, unknown>);
    return ensureProfileForUser(
      user.id,
      (user.user_metadata?.name as string | undefined) ?? meta.first_name,
      meta,
    );
  } catch {
    return null;
  }
}

export async function updateProfile(
  userId: string,
  input: ProfileUpdateInput,
): Promise<UserProfile | null> {
  const supabase = await createMargeoServerClient();

  // Toujours synchroniser auth metadata (fonctionne sans migration SQL)
  await syncAuthProfileMeta(userId, {
    first_name: input.first_name,
    last_name: input.last_name,
    avatar_url:
      input.avatar_url === null ? "" : (input.avatar_url ?? undefined),
  });

  let { data, error } = await supabase
    .from("margeo_profiles")
    .update(input)
    .eq("id", userId)
    .select("*")
    .single();

  if (isMissingColumnError(error)) {
    const legacyInput: ProfileUpdateInput = {
      name: input.name,
      city: input.city,
      vehicle: input.vehicle,
      cost_per_km: input.cost_per_km,
      target_hourly: input.target_hourly,
      daily_target: input.daily_target,
      platforms: input.platforms,
      other_platform: input.other_platform,
      onboarding_completed: input.onboarding_completed,
      min_benefit: input.min_benefit,
      max_distance_km: input.max_distance_km,
      empty_returns: input.empty_returns,
      weekly_hours: input.weekly_hours,
      last_lat: input.last_lat,
      last_lng: input.last_lng,
      location_permission: input.location_permission,
      location_updated_at: input.location_updated_at,
    };
    const legacy = await supabase
      .from("margeo_profiles")
      .update(legacyInput)
      .eq("id", userId)
      .select("*")
      .single();
    data = legacy.data;
    error = legacy.error;
  }

  if (error || !data) {
    if (process.env.NODE_ENV === "development" && error) {
      console.error("[uberly/profile] update failed:", error.message);
    }
    return null;
  }

  return rowToUserProfile(data as MargeoProfileRow, {
    first_name: input.first_name,
    last_name: input.last_name,
    avatar_url:
      input.avatar_url === null ? "" : (input.avatar_url ?? undefined),
  });
}
