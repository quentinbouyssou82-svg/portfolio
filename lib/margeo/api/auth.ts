import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { ApiError } from "./errors";
import { getAuthUser } from "../auth/session";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "../supabase/env";

/**
 * Auth for API routes. Must never throw a raw Supabase / cookie exception:
 * `@supabase/supabase-js` can throw `AuthSessionMissingError` when there is
 * no cookie session. That used to 500 `/quota`, `/analyze`, `/survey` and
 * ignored the iOS Bearer token (cookie `getUser()` ran first).
 */
export async function requireAuthUser(): Promise<User> {
  try {
    const h = await headers();
    const auth = h.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7).trim();
      const url = getMargeoSupabaseUrl();
      const key = getMargeoClientKey();
      if (url && key && token) {
        const client = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        try {
          const { data } = await client.auth.getUser(token);
          if (data.user) return data.user;
        } catch {
          throw new ApiError("Non authentifié", 401, "UNAUTHORIZED");
        }
      }
      throw new ApiError("Non authentifié", 401, "UNAUTHORIZED");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
  }

  const user = await getAuthUser();
  if (user) return user;

  throw new ApiError("Non authentifié", 401, "UNAUTHORIZED");
}
