import type { Vehicle } from "@/lib/margeo/types";

/**
 * Coûts au km réalistes (France, livraison urbaine 2025–2026).
 * Inclut carburant/électricité, entretien courant et usure amortie —
 * hors assurance globale et amortissement véhicule neuf.
 *
 * Sources d’ordre de grandeur : ADEME, barèmes fiscaux FR, études livreurs
 * urbains (coût marginal / km parcouru en mission).
 */
export const DEFAULT_VEHICLE_COSTS: Record<Vehicle, number> = {
  velo: 0.03,
  velo_electrique: 0.07,
  trottinette_electrique: 0.09,
  scooter: 0.18, // legacy → thermique
  scooter_thermique: 0.18,
  scooter_electrique: 0.1,
  moto: 0.22,
  voiture: 0.32, // legacy → essence
  voiture_essence: 0.32,
  voiture_diesel: 0.3,
  voiture_hybride: 0.24,
  voiture_electrique: 0.14,
};

/** Liste affichée onboarding / profil (sans alias legacy). */
export const VEHICLE_OPTIONS: Vehicle[] = [
  "velo",
  "velo_electrique",
  "trottinette_electrique",
  "scooter_thermique",
  "scooter_electrique",
  "moto",
  "voiture_essence",
  "voiture_diesel",
  "voiture_hybride",
  "voiture_electrique",
];

/** Normalise les anciennes valeurs DB vers les IDs canoniques. */
export function normalizeVehicle(vehicle: string | null | undefined): Vehicle {
  switch (vehicle) {
    case "scooter":
      return "scooter_thermique";
    case "voiture":
      return "voiture_essence";
    case "velo":
    case "velo_electrique":
    case "trottinette_electrique":
    case "scooter_thermique":
    case "scooter_electrique":
    case "moto":
    case "voiture_essence":
    case "voiture_diesel":
    case "voiture_hybride":
    case "voiture_electrique":
      return vehicle;
    default:
      return "scooter_thermique";
  }
}

export function defaultCostForVehicle(vehicle: Vehicle | string): number {
  const id = normalizeVehicle(vehicle);
  return DEFAULT_VEHICLE_COSTS[id] ?? 0.18;
}
