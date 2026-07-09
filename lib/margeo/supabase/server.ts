import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMargeoAnonKey, getMargeoSupabaseUrl } from "./env";

export async function createMargeoServerClient(): Promise<SupabaseClient> {
  const url = getMargeoSupabaseUrl();
  const key = getMargeoAnonKey();

  if (!url || !key) {
    throw new Error(
      "Margeo : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requis.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component — lecture seule
        }
      },
    },
  });
}

export async function getMargeoSession() {
  const supabase = await createMargeoServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
