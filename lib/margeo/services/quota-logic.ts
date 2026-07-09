/**
 * Logique quota pure — testable sans Supabase.
 */
export function computeRemainingToday(
  usedToday: number,
  dailyLimit: number,
): number {
  return Math.max(0, dailyLimit - usedToday);
}

export function isQuotaExceeded(
  usedToday: number,
  dailyLimit: number,
  premium: boolean,
): boolean {
  if (premium) return false;
  return usedToday >= dailyLimit;
}

export function buildQuotaStatus(
  premium: boolean,
  usedToday: number,
  dailyLimit: number,
): {
  premium: boolean;
  dailyLimit: number | null;
  usedToday: number;
  remainingToday: number | null;
} {
  if (premium) {
    return {
      premium: true,
      dailyLimit: null,
      usedToday,
      remainingToday: null,
    };
  }
  return {
    premium: false,
    dailyLimit,
    usedToday,
    remainingToday: computeRemainingToday(usedToday, dailyLimit),
  };
}
