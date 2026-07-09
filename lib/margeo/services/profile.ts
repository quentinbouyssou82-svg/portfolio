import type { MargeoProfileRow, ProfileUpdateInput } from "../supabase/schema";
import type { UserProfile } from "../types";
import { createMargeoServerClient } from "../supabase/server";

export function rowToUserProfile(row: MargeoProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
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
    lastLat: row.last_lat != null ? Number(row.last_lat) : undefined,
    lastLng: row.last_lng != null ? Number(row.last_lng) : undefined,
    locationPermission: row.location_permission,
  };
}

export async function getProfileForUser(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = await createMargeoServerClient();
  const { data, error } = await supabase
    .from("margeo_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToUserProfile(data as MargeoProfileRow);
}

/**
 * Garantit un profil pour chaque utilisateur auth (fallback si trigger SQL absent).
 */
export async function ensureProfileForUser(
  userId: string,
  name?: string,
): Promise<UserProfile | null> {
  const existing = await getProfileForUser(userId);
  if (existing) return existing;

  const supabase = await createMargeoServerClient();
  const { data, error } = await supabase
    .from("margeo_profiles")
    .insert({ id: userId, name: name?.trim() || "" })
    .select("*")
    .single();

  if (error) {
    return getProfileForUser(userId);
  }

  return rowToUserProfile(data as MargeoProfileRow);
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return ensureProfileForUser(
    user.id,
    user.user_metadata?.name as string | undefined,
  );
}

export async function updateProfile(
  userId: string,
  input: ProfileUpdateInput,
): Promise<UserProfile | null> {
  const supabase = await createMargeoServerClient();
  const { data, error } = await supabase
    .from("margeo_profiles")
    .update(input)
    .eq("id", userId)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToUserProfile(data as MargeoProfileRow);
}
