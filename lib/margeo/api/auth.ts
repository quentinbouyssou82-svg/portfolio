import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { ApiError } from "./errors";
import { createMargeoServerClient } from "../supabase/server";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "../supabase/env";

export async function requireAuthUser(): Promise<User> {
  // iOS / API : Bearer d'abord (évite un round-trip cookie SSR inutile).
  try {
    const h = await headers();
    const auth = h.get("authorization");
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7);
      const url = getMargeoSupabaseUrl();
      const key = getMargeoClientKey();
      if (url && key && token) {
        const client = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data } = await client.auth.getUser(token);
        if (data.user) return data.user;
      }
      throw new ApiError("Non authentifié", 401, "UNAUTHORIZED");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // ignore header edge cases → fallback cookie
  }

  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return user;

  throw new ApiError("Non authentifié", 401, "UNAUTHORIZED");
}
