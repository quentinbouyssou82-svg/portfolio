import type { Household, Member, MemberWithPreferences, Preferences } from "@/lib/maison/types";
import { getMaisonDb } from "@/lib/maison/supabase/server";
import { generateHouseholdKey, hashPin } from "@/lib/maison/env";

export async function getHousehold(id: string): Promise<Household | null> {
  const { data, error } = await getMaisonDb()
    .from("households")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Household) ?? null;
}

export async function getHouseholdByKey(key: string): Promise<Household | null> {
  const normalized = key.trim().toUpperCase();
  const { data, error } = await getMaisonDb()
    .from("households")
    .select("*")
    .eq("household_key", normalized)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Household) ?? null;
}

export async function createHousehold(input: {
  name: string;
  adminName: string;
  adminPin: string;
  budgetMonthly?: number;
}): Promise<{ household: Household; member: Member; householdKey: string }> {
  const db = getMaisonDb();
  let householdKey = generateHouseholdKey();

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await db
      .from("households")
      .select("id")
      .eq("household_key", householdKey)
      .maybeSingle();
    if (!existing) break;
    householdKey = generateHouseholdKey();
  }

  const { data: household, error: hErr } = await db
    .from("households")
    .insert({
      name: input.name.trim(),
      household_key: householdKey,
      budget_monthly: input.budgetMonthly ?? 480,
    })
    .select("*")
    .single();

  if (hErr) throw new Error(hErr.message);

  const pinHash = await hashPin(input.adminPin, household.id);

  const { data: member, error: mErr } = await db
    .from("members")
    .insert({
      household_id: household.id,
      name: input.adminName.trim(),
      role: "admin",
      pin_hash: pinHash,
      goals: null,
    })
    .select("*")
    .single();

  if (mErr) throw new Error(mErr.message);

  const { error: pErr } = await db.from("preferences").insert({
    member_id: member.id,
    liked_foods: [],
    disliked_foods: [],
    allergies: [],
    must_have_foods: [],
    nutrition_goal: "maintain",
  });

  if (pErr) throw new Error(pErr.message);

  return {
    household: household as Household,
    member: member as Member,
    householdKey,
  };
}

export async function updateHousehold(
  id: string,
  input: Partial<{
    name: string;
    budget_monthly: number;
    onboarding_completed: boolean;
    global_settings: Record<string, unknown>;
  }>,
): Promise<Household> {
  const { data, error } = await getMaisonDb()
    .from("households")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as Household;
}

export async function listHouseholdMembers(householdId: string): Promise<Member[]> {
  const { data, error } = await getMaisonDb()
    .from("members")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Member[];
}

export async function getMemberWithPreferences(
  memberId: string,
): Promise<MemberWithPreferences | null> {
  const { data: member, error } = await getMaisonDb()
    .from("members")
    .select("*")
    .eq("id", memberId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!member) return null;

  const { data: preferences } = await getMaisonDb()
    .from("preferences")
    .select("*")
    .eq("member_id", memberId)
    .maybeSingle();

  return {
    ...(member as Member),
    preferences: (preferences as Preferences) ?? null,
  };
}

export async function getMemberPinHash(memberId: string): Promise<string | null> {
  const { data, error } = await getMaisonDb()
    .from("members")
    .select("pin_hash")
    .eq("id", memberId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.pin_hash ?? null;
}
