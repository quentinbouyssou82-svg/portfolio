"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "./env";

let client: SupabaseClient | null = null;

export function createMargeoBrowserClient(): SupabaseClient {
  const url = getMargeoSupabaseUrl();
  const key = getMargeoClientKey();

  if (!url || !key) {
    throw new Error(
      "Margeo : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY requis.",
    );
  }

  if (!client) {
    client = createBrowserClient(url, key);
  }

  return client;
}
