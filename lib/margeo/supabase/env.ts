/** Clé client Supabase (publishable sb_* ou legacy JWT anon). */
export function getMargeoClientKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim()
  );
}

/** @deprecated Utiliser getMargeoClientKey — alias rétrocompat. */
export function getMargeoAnonKey(): string | undefined {
  return getMargeoClientKey();
}

export function getMargeoSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim()
  );
}

/** Clé serveur (secret sb_* ou legacy service_role JWT). */
export function getMargeoServiceKey(): string | undefined {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export function isMargeoSupabaseConfigured(): boolean {
  return Boolean(getMargeoSupabaseUrl() && getMargeoClientKey());
}
