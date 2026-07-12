import type { User } from "@supabase/supabase-js";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";

/** Utilisateur auth courant (null si déconnecté). Ne lance jamais. */
export async function getAuthUser(): Promise<User | null> {
  try {
    const supabase = await createMargeoServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  } catch {
    return null;
  }
}
