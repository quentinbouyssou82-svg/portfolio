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
    // Transient JWT refresh / network blips: treat as null so callers can retry
    // via waitForAuthUser instead of crashing the RSC tree.
    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[driveely/auth] getUser:", error.message);
      }
      return null;
    }
    return user;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[driveely/auth] getUser exception:", err);
    }
    return null;
  }
}
