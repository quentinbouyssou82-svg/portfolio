import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getMargeoServiceKey, getMargeoSupabaseUrl } from "./env";

let adminClient: SupabaseClient | null = null;

/** Client service_role — opérations serveur uniquement. */
export function getMargeoAdminDb(): SupabaseClient {
  const url = getMargeoSupabaseUrl();
  const key = getMargeoServiceKey();

  if (!url || !key) {
    throw new Error(
      "Margeo : SUPABASE_URL + SUPABASE_SECRET_KEY (ou SERVICE_ROLE) requis côté serveur.",
    );
  }

  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}
