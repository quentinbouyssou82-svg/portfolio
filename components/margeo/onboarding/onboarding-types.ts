/** État local de l'onboarding — prêt à être branché au backend. */
export type OnboardingVehicleId =
  | "velo"
  | "velo_electrique"
  | "trottinette_electrique"
  | "scooter_thermique"
  | "scooter_electrique"
  | "moto"
  | "voiture_essence"
  | "voiture_diesel"
  | "voiture_hybride"
  | "voiture_electrique";

export type EmptyReturnPreference = "yes" | "no" | "short_only";

export type WeeklyHoursId =
  | "under_10"
  | "10_20"
  | "20_30"
  | "30_40"
  | "over_40";

export interface OnboardingDraft {
  vehicle: OnboardingVehicleId | null;
  targetHourly: number;
  minBenefit: number;
  emptyReturns: EmptyReturnPreference | null;
  maxDistanceKm: number;
  weeklyHours: WeeklyHoursId | null;
  completedAt?: string;
}

export const DEFAULT_ONBOARDING_DRAFT: OnboardingDraft = {
  vehicle: null,
  targetHourly: 22,
  minBenefit: 6,
  emptyReturns: null,
  maxDistanceKm: 8,
  weeklyHours: null,
};

export const ONBOARDING_STORAGE_KEY = "driveely-onboarding-draft";

export const VEHICLE_OPTIONS: {
  id: OnboardingVehicleId;
  label: string;
}[] = [
  { id: "velo", label: "Vélo" },
  { id: "velo_electrique", label: "Vélo électrique" },
  { id: "trottinette_electrique", label: "Trottinette élec." },
  { id: "scooter_thermique", label: "Scooter thermique" },
  { id: "scooter_electrique", label: "Scooter électrique" },
  { id: "moto", label: "Moto" },
  { id: "voiture_essence", label: "Voiture essence" },
  { id: "voiture_diesel", label: "Voiture diesel" },
  { id: "voiture_hybride", label: "Voiture hybride" },
  { id: "voiture_electrique", label: "Voiture électrique" },
];

export const EMPTY_RETURN_OPTIONS: {
  id: EmptyReturnPreference;
  label: string;
}[] = [
  { id: "yes", label: "Oui" },
  { id: "no", label: "Non" },
  { id: "short_only", label: "Courtes distances seulement" },
];

export const WEEKLY_HOURS_OPTIONS: {
  id: WeeklyHoursId;
  label: string;
  description: string;
}[] = [
  { id: "under_10", label: "Moins de 10 h", description: "Occasionnel" },
  { id: "10_20", label: "10 – 20 h", description: "Soirs & week-ends" },
  { id: "20_30", label: "20 – 30 h", description: "Temps partiel" },
  { id: "30_40", label: "30 – 40 h", description: "Régulier" },
  { id: "over_40", label: "Plus de 40 h", description: "Temps plein" },
];

export function vehicleLabel(id: OnboardingVehicleId | null): string {
  if (!id) return "—";
  return VEHICLE_OPTIONS.find((v) => v.id === id)?.label ?? "—";
}

export function emptyReturnLabel(id: EmptyReturnPreference | null): string {
  if (!id) return "—";
  return EMPTY_RETURN_OPTIONS.find((o) => o.id === id)?.label ?? "—";
}

export function weeklyHoursLabel(id: WeeklyHoursId | null): string {
  if (!id) return "—";
  return WEEKLY_HOURS_OPTIONS.find((o) => o.id === id)?.label ?? "—";
}

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    ONBOARDING_STORAGE_KEY,
    JSON.stringify({ ...draft, completedAt: new Date().toISOString() }),
  );
}
