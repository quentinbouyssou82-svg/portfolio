"use server";

import type { MargeoActionResult } from "./actions";

/** Désactivé pour la bêta — pas d'envoi d'email. */
export async function resetPasswordAction(
  _prev: MargeoActionResult | undefined,
  _formData: FormData,
): Promise<MargeoActionResult> {
  return {
    ok: false,
    message: "Réinitialisation du mot de passe bientôt disponible.",
  };
}
