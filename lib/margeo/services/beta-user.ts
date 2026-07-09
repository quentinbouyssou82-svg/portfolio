import { isUberlyBetaMode } from "../api/beta-config";
import { getMargeoAdminDb } from "../supabase/admin";

/** Marque un utilisateur comme testeur beta (mode beta actif uniquement). */
export async function markBetaTester(userId: string): Promise<void> {
  if (!isUberlyBetaMode()) return;

  try {
    const admin = getMargeoAdminDb();
    await admin
      .from("margeo_profiles")
      .update({ is_beta_tester: true })
      .eq("id", userId);
  } catch (e) {
    console.warn("[uberly/beta] mark tester skipped:", e);
  }
}
