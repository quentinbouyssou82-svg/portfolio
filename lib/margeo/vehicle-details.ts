/**
 * Détails véhicule + estimation du coût au km.
 * Extensible : ajouter des champs dans VehicleDetails sans casser le schéma.
 */

import type { Vehicle } from "@/lib/margeo/types";
import { defaultCostForVehicle, normalizeVehicle } from "@/lib/margeo/vehicle-costs";

export type VehicleFuel =
  | "essence"
  | "diesel"
  | "electrique"
  | "hybride"
  | "aucun";

export interface VehicleDetails {
  brand: string;
  model: string;
  /** Année modèle, optionnelle */
  year: number | null;
  fuel: VehicleFuel;
  /** L/100 km ou kWh/100 km selon l’énergie */
  consumptionPer100Km: number | null;
  /** €/L ou €/kWh */
  energyPrice: number | null;
  /** true si l’utilisateur a forcé le coût/km à la main */
  costPerKmManual: boolean;
}

export const EMPTY_VEHICLE_DETAILS: VehicleDetails = {
  brand: "",
  model: "",
  year: null,
  fuel: "aucun",
  consumptionPer100Km: null,
  energyPrice: null,
  costPerKmManual: false,
};

export const VEHICLE_FUEL_LABELS: Record<VehicleFuel, string> = {
  essence: "Essence",
  diesel: "Diesel",
  electrique: "Électricité",
  hybride: "Hybride",
  aucun: "Non concerné",
};

/** Suggestions d’énergie selon le type de véhicule. */
export function defaultFuelForVehicle(vehicle: Vehicle | string): VehicleFuel {
  const id = normalizeVehicle(vehicle);
  switch (id) {
    case "velo":
      return "aucun";
    case "velo_electrique":
    case "trottinette_electrique":
    case "scooter_electrique":
    case "voiture_electrique":
      return "electrique";
    case "voiture_diesel":
      return "diesel";
    case "voiture_hybride":
      return "hybride";
    case "scooter_thermique":
    case "moto":
    case "voiture_essence":
      return "essence";
    default:
      return "essence";
  }
}

/** Prix énergie par défaut (€/L ou €/kWh) — France 2026, ordre de grandeur. */
export const DEFAULT_ENERGY_PRICE: Record<Exclude<VehicleFuel, "aucun">, number> =
  {
    essence: 1.85,
    diesel: 1.75,
    electrique: 0.22,
    hybride: 1.85,
  };

/** Consommations types si non renseignées. */
export function typicalConsumption(
  vehicle: Vehicle | string,
  fuel: VehicleFuel,
): number | null {
  const id = normalizeVehicle(vehicle);
  if (fuel === "aucun" || id === "velo") return null;
  if (fuel === "electrique") {
    if (id === "velo_electrique" || id === "trottinette_electrique") return 1.2;
    if (id === "scooter_electrique") return 4;
    return 16; // voiture
  }
  if (id === "scooter_thermique") return 3.5;
  if (id === "moto") return 5.5;
  if (id === "voiture_diesel") return 5.5;
  if (id === "voiture_hybride") return 4.8;
  return 7.2; // essence
}

/**
 * Part « fixe » (entretien / usure) extraite du barème véhicule,
 * pour ne pas double-compter le carburant.
 */
function maintenanceShare(vehicle: Vehicle | string): number {
  const base = defaultCostForVehicle(vehicle);
  const id = normalizeVehicle(vehicle);
  if (id === "velo") return base;
  if (id.startsWith("velo") || id.startsWith("trottinette")) return base * 0.7;
  return base * 0.45;
}

/**
 * Coût €/km estimé = énergie + entretien/usure.
 * Si conso / prix absents → barème véhicule.
 */
export function estimateCostPerKm(
  vehicle: Vehicle | string,
  details: Partial<VehicleDetails> | null | undefined,
): number {
  const id = normalizeVehicle(vehicle);
  const fuel = details?.fuel ?? defaultFuelForVehicle(id);
  const consumption =
    details?.consumptionPer100Km ?? typicalConsumption(id, fuel);
  const price =
    details?.energyPrice ??
    (fuel !== "aucun" ? DEFAULT_ENERGY_PRICE[fuel] : null);

  if (
    fuel === "aucun" ||
    consumption == null ||
    price == null ||
    !Number.isFinite(consumption) ||
    !Number.isFinite(price)
  ) {
    return defaultCostForVehicle(id);
  }

  const energyPerKm = (consumption / 100) * price;
  const total = energyPerKm + maintenanceShare(id);
  return Math.round(Math.max(0.01, total) * 1000) / 1000;
}

export function parseVehicleDetails(
  raw: unknown,
): VehicleDetails {
  if (!raw || typeof raw !== "object") return { ...EMPTY_VEHICLE_DETAILS };
  const o = raw as Record<string, unknown>;
  const fuel = o.fuel;
  return {
    brand: typeof o.brand === "string" ? o.brand : "",
    model: typeof o.model === "string" ? o.model : "",
    year:
      typeof o.year === "number" && Number.isFinite(o.year)
        ? Math.round(o.year)
        : null,
    fuel:
      fuel === "essence" ||
      fuel === "diesel" ||
      fuel === "electrique" ||
      fuel === "hybride" ||
      fuel === "aucun"
        ? fuel
        : "aucun",
    consumptionPer100Km:
      typeof o.consumptionPer100Km === "number" &&
      Number.isFinite(o.consumptionPer100Km)
        ? o.consumptionPer100Km
        : null,
    energyPrice:
      typeof o.energyPrice === "number" && Number.isFinite(o.energyPrice)
        ? o.energyPrice
        : null,
    costPerKmManual: Boolean(o.costPerKmManual),
  };
}
