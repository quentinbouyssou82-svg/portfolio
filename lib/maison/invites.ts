/**
 * Invitations foyer — architecture future (non implémenté).
 * Lien : /demos/maison/rejoindre?invite={token}
 * QR   : encode l’URL ci-dessus
 */

export interface HouseholdInviteDraft {
  id: string;
  householdId: string;
  token: string;
  expiresAt: string;
  createdByMemberId: string;
}

/** Génération future — retourne null tant que non branché Supabase. */
export function buildInviteUrl(_token: string): string | null {
  return null;
}
