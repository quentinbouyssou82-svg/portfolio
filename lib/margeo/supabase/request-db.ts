import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { getMargeoAdminDb } from "./admin";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "./env";
import { createMargeoServerClient } from "./server";

/**
 * DB client for API routes after `requireAuthUser()`.
 * iOS sends Bearer (no cookies) — cookie SSR client cannot see RLS rows.
 *
 * Sécurité : on privilégie le client user (Bearer ou cookies).
 * Le fallback service_role n'est utilisé que si aucun contexte user n'est
 * disponible (ne doit pas arriver après requireAuthUser). Loggé pour audit.
 */
export async function createMargeoRequestDb(): Promise<SupabaseClient> {
  const url = getMargeoSupabaseUrl();
  const key = getMargeoClientKey();

  try {
    const auth = (await headers()).get("authorization");
    if (auth?.startsWith("Bearer ") && url && key) {
      const token = auth.slice(7).trim();
      if (token) {
        return createClient(url, key, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
      }
    }
  } catch {
    // Not in a request context.
  }

  try {
    const cookieClient = await createMargeoServerClient();
    return cookieClient;
  } catch {
    // fall through
  }

  console.warn(
    "[driveely/security] request-db falling back to service_role — vérifier requireAuthUser en amont",
  );
  try {
    return getMargeoAdminDb();
  } catch {
    return createMargeoServerClient();
  }
}
