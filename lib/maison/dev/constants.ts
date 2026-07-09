/** Mode développement Maison — jamais actif en production par défaut */

export function isMaisonDevModeAllowed(): boolean {
  if (process.env.MAISON_DEV_MODE === "true") return true;
  if (process.env.NODE_ENV === "production") return false;
  return process.env.MAISON_DEV_MODE !== "false";
}

export const DEV_HOUSEHOLD_KEY = "FAM-DEVMODE";
export const DEV_ADMIN_PIN = "4242";

/** Bypass connexion supermarché (dev env ou foyer FAM-DEVMODE) */
export function isGroceryGateBypassed(householdKey: string): boolean {
  if (isMaisonDevModeAllowed()) return true;
  if (householdKey === DEV_HOUSEHOLD_KEY) return true;
  return false;
}
