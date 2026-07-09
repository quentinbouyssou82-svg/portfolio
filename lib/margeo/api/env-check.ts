/** Vérifie les variables critiques au démarrage d'une route Uberly. */
export interface EnvStatus {
  supabase: boolean;
  serviceRole: boolean;
  gemini: boolean;
  appUrl: boolean;
  readyForBeta: boolean;
  missing: string[];
}

export function checkUberlyEnv(): EnvStatus {
  const missing: string[] = [];

  const supabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
  if (!supabase) missing.push("NEXT_PUBLIC_SUPABASE_URL/ANON_KEY");

  const serviceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  if (!serviceRole) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  const gemini = Boolean(
    process.env.UBERLY_GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim(),
  );
  if (!gemini) missing.push("UBERLY_GEMINI_API_KEY");

  const appUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());
  if (!appUrl) missing.push("NEXT_PUBLIC_APP_URL");

  return {
    supabase,
    serviceRole,
    gemini,
    appUrl,
    readyForBeta: supabase && serviceRole && gemini,
    missing,
  };
}
