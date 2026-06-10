import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getControlTowerSupabaseAnonKey,
  getControlTowerSupabaseUrl,
} from "@/lib/control-tower/env";

let client: SupabaseClient | null = null;

/** Client Supabase données uniquement (pas d'auth email). Préfère service_role côté serveur. */
export function getControlTowerDb(): SupabaseClient {
  const url = getControlTowerSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const key = serviceKey || getControlTowerSupabaseAnonKey();

  if (!url || !key) {
    throw new Error(
      "Supabase : SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (recommandé) ou SUPABASE_ANON_KEY",
    );
  }

  if (!client) {
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return client;
}
