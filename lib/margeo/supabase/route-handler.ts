import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getMargeoClientKey, getMargeoSupabaseUrl } from "./env";

/** Client Supabase pour Route Handlers — persiste les cookies sur la réponse. */
export function createMargeoRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
): SupabaseClient {
  const url = getMargeoSupabaseUrl();
  const key = getMargeoClientKey();

  if (!url || !key) {
    throw new Error(
      "Margeo : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY requis.",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
