import type { NextRequest } from "next/server";

/** True when the request carries a Supabase SSR auth cookie jar (possibly mid-refresh). */
export function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    ({ name }) =>
      name.includes("-auth-token") ||
      name.startsWith("sb-") ||
      name.includes("supabase-auth"),
  );
}
