import { NUTRITION_GOAL_LABELS } from "@/lib/maison/constants";
import type { MemberWithPreferences } from "@/lib/maison/types";

export interface MemberPreferenceSummary {
  id: string;
  name: string;
  role: string;
  dietType: string;
  nutritionGoalLabel: string;
  likedFoods: string[];
  dislikedFoods: string[];
  allergies: string[];
  mustHaveFoods: string[];
}

export function buildMemberPreferenceSummaries(
  members: MemberWithPreferences[],
): MemberPreferenceSummary[] {
  return members.map((m) => {
    const prefs = m.preferences;
    return {
      id: m.id,
      name: m.name,
      role: m.role === "admin" ? "Admin" : "Membre",
      dietType: prefs?.diet_type?.trim() || "omnivore",
      nutritionGoalLabel:
        NUTRITION_GOAL_LABELS[prefs?.nutrition_goal ?? "maintain"] ?? "Maintien",
      likedFoods: prefs?.liked_foods ?? [],
      dislikedFoods: [
        ...(prefs?.disliked_foods ?? []),
        ...(prefs?.forbidden_foods ?? []),
      ],
      allergies: [...(prefs?.allergies ?? []), ...(prefs?.intolerances ?? [])],
      mustHaveFoods: prefs?.must_have_foods ?? [],
    };
  });
}
