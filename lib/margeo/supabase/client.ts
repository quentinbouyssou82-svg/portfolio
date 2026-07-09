"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMargeoAnonKey, getMargeoSupabaseUrl } from "./env";

let client: SupabaseClient | null = null;

export function createMargeoBrowserClient(): SupabaseClient {
  const url = getMargeoSupabaseUrl();
  const key = getMargeoAnonKey();

  if (!url || !key) {
    throw new Error(
      "Margeo : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requis.",
    );
  }

  if (!client) {
    client = createBrowserClient(url, key);
  }

  return client;
}
