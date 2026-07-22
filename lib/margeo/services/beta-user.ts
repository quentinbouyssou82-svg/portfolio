import { isDriveelyBetaMode } from "../api/beta-config";
import { getMargeoAdminDb } from "../supabase/admin";

/** Marque un utilisateur comme testeur beta (mode beta actif uniquement). */
export async function markBetaTester(userId: string): Promise<void> {
  if (!isDriveelyBetaMode()) return;

  try {
    const admin = getMargeoAdminDb();
    await admin
      .from("margeo_profiles")
      .update({ is_beta_tester: true })
      .eq("id", userId);
  } catch (e) {
    console.warn("[driveely/beta] mark tester skipped:", e);
  }
}
