import { FOOD_BY_ID } from "@/lib/maison/foods/catalog";
import {
  foodProfileToPreferenceUpdate,
  preferencesToFoodProfile,
  sanitizeFoodRatingsForDiet,
  validateMemberFoodProfile,
} from "@/lib/maison/foods/sync";
import { buildTasteSummaryForAI } from "@/lib/maison/foods/taste-summary";
import type { MemberFoodProfile } from "@/lib/maison/foods/types";
import { formatPreferencesSchemaError } from "@/lib/maison/supabase/schema";
import { getMaisonDb } from "@/lib/maison/supabase/server";
import type { Preferences } from "@/lib/maison/types";

function throwDbError(error: { message: string }): never {
  throw new Error(formatPreferencesSchemaError(error.message));
}

export interface MemberTasteContext {
  memberId: string;
  name: string;
  profile: MemberFoodProfile;
  aiSummary: string;
}

export async function getMemberPreferences(memberId: string): Promise<Preferences | null> {
  const { data, error } = await getMaisonDb()
    .from("preferences")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  if (error) throwDbError(error);
  return (data as Preferences) ?? null;
}

export async function getMemberFoodProfile(memberId: string): Promise<MemberFoodProfile | null> {
  const prefs = await getMemberPreferences(memberId);
  if (!prefs) return null;
  return preferencesToFoodProfile(prefs);
}

export async function assertMemberBelongsToHousehold(
  memberId: string,
  householdId: string,
): Promise<void> {
  const { data, error } = await getMaisonDb()
    .from("members")
    .select("id")
    .eq("id", memberId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (error) throwDbError(error);
  if (!data) throw new Error("Membre introuvable dans ce foyer.");
}

export async function saveMemberFoodProfile(
  memberId: string,
  profile: MemberFoodProfile,
  options?: { markComplete?: boolean },
): Promise<MemberFoodProfile> {
  const sanitized = sanitizeFoodRatingsForDiet(profile);
  const validationError = validateMemberFoodProfile(sanitized);
  if (validationError) throw new Error(validationError);

  const update = {
    ...foodProfileToPreferenceUpdate(sanitized),
    updated_at: new Date().toISOString(),
    ...(options?.markComplete !== false
      ? { taste_completed_at: new Date().toISOString() }
      : {}),
  };

  const { data, error } = await getMaisonDb()
    .from("preferences")
    .update(update)
    .eq("member_id", memberId)
    .select("*")
    .single();

  if (error) throwDbError(error);
  return preferencesToFoodProfile(data as Preferences);
}

export function memberHasTasteProfile(prefs: Preferences | null): boolean {
  if (!prefs) return false;
  const ratings = Object.keys(prefs.food_ratings ?? {}).length;
  const habits = Object.keys(prefs.consumption_habits ?? {}).length;
  const hasDiet = Boolean(prefs.diet_type && prefs.diet_type !== "omnivore");
  const hasRestrictions =
    (prefs.allergies?.length ?? 0) > 0 ||
    (prefs.forbidden_foods?.length ?? 0) > 0 ||
    (prefs.intolerances?.length ?? 0) > 0;

  return ratings > 0 || habits > 0 || hasDiet || hasRestrictions || Boolean(prefs.taste_completed_at);
}

export async function getHouseholdTasteContexts(
  householdId: string,
  members: Array<{ id: string; name: string; preferences: Preferences | null }>,
): Promise<MemberTasteContext[]> {
  return members.map((member) => {
    const profile = preferencesToFoodProfile(member.preferences);
    return {
      memberId: member.id,
      name: member.name,
      profile,
      aiSummary: buildTasteSummaryForAI(profile),
    };
  });
}

/** IDs aliment valides pour validation côté API */
export function isKnownFoodId(foodId: string): boolean {
  return foodId in FOOD_BY_ID;
}
