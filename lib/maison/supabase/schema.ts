import { getMaisonDb } from "@/lib/maison/supabase/server";

/** Colonnes requises sur public.preferences (profil gustatif v2+) */
export const PREFERENCES_SCHEMA_COLUMNS = [
  "diet_type",
  "forbidden_foods",
  "intolerances",
  "food_ratings",
  "consumption_habits",
  "preferred_meals",
  "dislike_levels",
  "taste_completed_at",
] as const;

const MIGRATION_HINT =
  "Exécute supabase/maison-preferences-migrate.sql dans Supabase → SQL Editor, puis attends quelques secondes (reload schema).";

export function formatPreferencesSchemaError(message: string): string {
  if (
    message.includes("schema cache") ||
    message.includes("Could not find") ||
    message.includes("does not exist") ||
    message.includes("column")
  ) {
    const colMatch = message.match(/'([^']+)' column/);
    const col = colMatch?.[1];
    return col
      ? `Colonne preferences.${col} absente en base. ${MIGRATION_HINT}`
      : `Schéma preferences incomplet. ${MIGRATION_HINT}`;
  }
  return message;
}

export async function checkPreferencesSchema(): Promise<{
  ok: boolean;
  error?: string;
  hint?: string;
}> {
  const select = [
    "id",
    "member_id",
    "liked_foods",
    ...PREFERENCES_SCHEMA_COLUMNS,
  ].join(",");

  const { error } = await getMaisonDb().from("preferences").select(select).limit(0);

  if (error) {
    return {
      ok: false,
      error: error.message,
      hint: formatPreferencesSchemaError(error.message),
    };
  }

  return { ok: true };
}
