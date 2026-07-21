import type { RideOffer } from "../types";
import { createMargeoServerClient } from "../supabase/server";

export interface UserCalibration {
  /** Multiplicateur durée (1 = neutre, >1 = courses plus longues que prévu). */
  durationFactor: number;
  /** Écart moyen gain estimé vs réel (€). */
  gainBias: number;
  sampleSize: number;
}

const NEUTRAL: UserCalibration = {
  durationFactor: 1,
  gainBias: 0,
  sampleSize: 0,
};

const CACHE_TTL_MS = 5 * 60_000;
const calibrationCache = new Map<
  string,
  { value: UserCalibration; expires: number }
>();

/**
 * Calibre les estimations à partir du feedback utilisateur (courses acceptées).
 * Cache 5 min — la plupart des bêta-testeurs n'ont pas encore de feedback.
 */
export async function getUserCalibration(
  userId: string,
): Promise<UserCalibration> {
  const cached = calibrationCache.get(userId);
  if (cached && Date.now() < cached.expires) return cached.value;

  const supabase = await createMargeoServerClient();

  // Fast-path : 1 requête count — zéro feedback → NEUTRAL sans jointure
  const { count, error: countError } = await supabase
    .from("margeo_feedback")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("accepted", true)
    .not("actual_duration_min", "is", null);

  if (countError || !count || count < 3) {
    calibrationCache.set(userId, {
      value: NEUTRAL,
      expires: Date.now() + CACHE_TTL_MS,
    });
    return NEUTRAL;
  }

  const { data: feedbacks, error } = await supabase
    .from("margeo_feedback")
    .select("analysis_id, actual_duration_min, actual_gain")
    .eq("user_id", userId)
    .eq("accepted", true)
    .not("actual_duration_min", "is", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !feedbacks?.length) {
    calibrationCache.set(userId, {
      value: NEUTRAL,
      expires: Date.now() + CACHE_TTL_MS,
    });
    return NEUTRAL;
  }

  const analysisIds = feedbacks.map((f) => f.analysis_id);
  const { data: analyses } = await supabase
    .from("margeo_analyses")
    .select("id, gross_gain, ride:margeo_rides(duration_min)")
    .in("id", analysisIds);

  if (!analyses?.length) {
    calibrationCache.set(userId, {
      value: NEUTRAL,
      expires: Date.now() + CACHE_TTL_MS,
    });
    return NEUTRAL;
  }

  const byId = new Map(
    analyses.map((a) => {
      const rideRaw = a.ride as
        | { duration_min: number }
        | { duration_min: number }[]
        | null;
      const ride = Array.isArray(rideRaw) ? rideRaw[0] : rideRaw;
      return [
        a.id as string,
        {
          grossGain: Number(a.gross_gain),
          durationMin: ride?.duration_min ?? 0,
        },
      ];
    }),
  );

  let durationRatioSum = 0;
  let durationCount = 0;
  let gainBiasSum = 0;
  let gainCount = 0;

  for (const fb of feedbacks) {
    const linked = byId.get(fb.analysis_id);
    if (!linked) continue;

    const actualDuration = fb.actual_duration_min;
    if (actualDuration != null && linked.durationMin > 0 && actualDuration > 0) {
      durationRatioSum += actualDuration / linked.durationMin;
      durationCount += 1;
    }

    if (fb.actual_gain != null) {
      gainBiasSum += Number(fb.actual_gain) - linked.grossGain;
      gainCount += 1;
    }
  }

  if (durationCount === 0 && gainCount === 0) {
    calibrationCache.set(userId, {
      value: NEUTRAL,
      expires: Date.now() + CACHE_TTL_MS,
    });
    return NEUTRAL;
  }

  const durationFactor =
    durationCount > 0
      ? Math.min(1.5, Math.max(0.75, durationRatioSum / durationCount))
      : 1;

  const gainBias =
    gainCount > 0 ? Math.round((gainBiasSum / gainCount) * 100) / 100 : 0;

  const value: UserCalibration = {
    durationFactor,
    gainBias,
    sampleSize: Math.max(durationCount, gainCount),
  };
  calibrationCache.set(userId, {
    value,
    expires: Date.now() + CACHE_TTL_MS,
  });
  return value;
}

/** Applique la calibration utilisateur sur une offre extraite. */
export function applyCalibrationToOffer(
  offer: RideOffer,
  calibration: UserCalibration,
): RideOffer {
  if (calibration.sampleSize < 3) return offer;

  return {
    ...offer,
    durationMin:
      offer.durationMin != null
        ? Math.round(offer.durationMin * calibration.durationFactor)
        : offer.durationMin,
    payout: Math.max(
      0,
      Math.round((offer.payout + calibration.gainBias) * 100) / 100,
    ),
  };
}

export function getNeutralCalibration(): UserCalibration {
  return NEUTRAL;
}
