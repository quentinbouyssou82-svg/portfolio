import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getMaisonServiceKey, getMaisonSupabaseUrl } from "@/lib/maison/env";

let client: SupabaseClient | null = null;

/** Client Supabase service_role — toute la logique Maison passe par le serveur. */
export function getMaisonDb(): SupabaseClient {
  const url = getMaisonSupabaseUrl();
  const key = getMaisonServiceKey();

  if (!url || !key) {
    throw new Error(
      "Maison : SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY requis dans .env.local",
    );
  }

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}
