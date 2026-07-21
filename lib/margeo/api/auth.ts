import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { ApiError } from "./errors";
import { createMargeoServerClient } from "../supabase/server";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "../supabase/env";

export async function requireAuthUser(): Promise<User> {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return user;

  // Bearer token (API clients / QA) — sans changer le flux cookie SSR
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
    }
  } catch {
    // ignore
  }

  throw new ApiError("Non authentifié", 401, "UNAUTHORIZED");
}
