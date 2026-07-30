import { getMargeoAdminDb } from "../supabase/admin";

/**
 * Marque un utilisateur comme testeur bêta en base.
 * @param force — true depuis « Rejoindre la bêta » (ignore l’ancien gate env-only).
 */
export async function markBetaTester(
  userId: string,
  opts?: { force?: boolean },
): Promise<void> {
  try {
    const admin = getMargeoAdminDb();
    await admin
      .from("margeo_profiles")
      .update({ is_beta_tester: true })
      .eq("id", userId);

    if (opts?.force) {
      // no-op marker for logs
    }
  } catch (e) {
    console.warn("[driveely/beta] mark tester skipped:", e);
  }
}
