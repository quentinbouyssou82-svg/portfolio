import { getMargeoAdminDb } from "../supabase/admin";

/**
 * Marque un utilisateur comme testeur bêta en base (service_role).
 * Réservé aux chemins serveur allowlistés — ne pas appeler depuis un
 * simple cookie / « Rejoindre la bêta » UI (sinon self-upgrade Elite).
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
    // Erreur visible : un testeur qui n'est pas marqué verra la gate à tort.
    console.error("[driveely/beta] mark tester FAILED:", e);
  }
}

/** Allowlist serveur pour unlock Elite en production. */
export async function isBetaTester(userId: string): Promise<boolean> {
  try {
    const admin = getMargeoAdminDb();
    const { data, error } = await admin
      .from("margeo_profiles")
      .select("is_beta_tester")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return false;
    return Boolean(
      (data as { is_beta_tester?: boolean }).is_beta_tester,
    );
  } catch {
    return false;
  }
}
