import {
  vehicleLabel,
  weeklyHoursLabel,
  type WeeklyHoursId,
} from "@/components/margeo/onboarding/onboarding-types";
import type { UserProfile } from "@/lib/margeo/types";

const WEEKLY_HOURS_MID: Record<WeeklyHoursId, number> = {
  under_10: 6,
  "10_20": 15,
  "20_30": 25,
  "30_40": 35,
  over_40: 45,
};

export type PaywallPersonalization = {
  vehicleLabel: string;
  weeklyHoursLabel: string;
  targetHourly: number;
  /** Heures « récupérées » estimées / semaine (indicatif) */
  hoursSavedPerWeek: number;
  /** Gain potentiel / mois si on évite des courses à perte (indicatif) */
  monthlyUpsideEur: number;
  hasProfile: boolean;
};

/**
 * Projections simples à partir du profil onboarding.
 * Marquées estimation indicative côté UI.
 */
export function buildPaywallPersonalization(
  profile: UserProfile | null | undefined,
): PaywallPersonalization {
  const weeklyHours = (profile?.weeklyHours ?? "20_30") as WeeklyHoursId;
  const hours = WEEKLY_HOURS_MID[weeklyHours] ?? 25;
  const targetHourly = profile?.targetHourly ?? 22;
  const minBenefit = profile?.minBenefit ?? 6;

  // Hypothèse prudente : ~8 % du temps perdu sur de mauvaises acceptations.
  const hoursSavedPerWeek = Math.max(0.5, Math.round(hours * 0.08 * 10) / 10);
  // ~1.5 courses à perte évitées / semaine × minBenefit
  const monthlyUpsideEur = Math.round(1.5 * minBenefit * 4.3);

  return {
    vehicleLabel: vehicleLabel(
      (profile?.vehicle as Parameters<typeof vehicleLabel>[0]) ?? null,
    ),
    weeklyHoursLabel: weeklyHoursLabel(weeklyHours),
    targetHourly,
    hoursSavedPerWeek,
    monthlyUpsideEur,
    hasProfile: Boolean(profile?.onboardingCompleted || profile?.weeklyHours),
  };
}
