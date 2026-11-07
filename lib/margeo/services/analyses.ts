import { analyzeOffer } from "../engine";
import type {
  MargeoAnalysisRow,
  MargeoAnalysisWithRide,
  MargeoRideRow,
} from "../supabase/schema";
import type { RideAnalysis, RideOffer, UserProfile } from "../types";
import { createMargeoServerClient } from "../supabase/server";
import { getHistoryCutoffIsoForUser } from "./quota";
import {
  buildRideInsertFallback,
  buildRideInsertPayload,
  finiteMoney,
  finiteScore,
  type PersistRideOpts,
} from "./persist-analysis";

function rowToRideOffer(ride: MargeoRideRow): RideOffer {
  return {
    id: ride.id,
    platform: ride.platform as RideOffer["platform"],
    pickup: ride.pickup,
    dropoff: ride.dropoff,
    payout: Number(ride.payout),
    distanceKm:
      ride.distance_km != null ? Number(ride.distance_km) : undefined,
    durationMin:
      ride.duration_min != null ? ride.duration_min : undefined,
    emptyReturnKm: Number(ride.empty_return_km),
    pickupDistanceKm: ride.pickup_distance_km
      ? Number(ride.pickup_distance_km)
      : undefined,
  };
}

export function rowToRideAnalysis(
  analysis: MargeoAnalysisRow,
  ride: MargeoRideRow,
): RideAnalysis {
  return {
    id: analysis.id,
    offer: rowToRideOffer(ride),
    analyzedAt: analysis.analyzed_at,
    grossGain: Number(analysis.gross_gain),
    estimatedCost: Number(analysis.estimated_cost),
    netGain: Number(analysis.net_gain),
    hourlyRate: Number(analysis.hourly_rate),
    score: analysis.score,
    verdict: analysis.verdict,
    explanation: analysis.explanation,
    insights: Array.isArray(analysis.insights) ? analysis.insights : [],
    scoreBreakdown: Array.isArray(analysis.score_breakdown)
      ? analysis.score_breakdown
      : [],
  };
}

export async function listAnalysesForUser(
  userId: string,
  limit = 50,
): Promise<RideAnalysis[]> {
  const historyCutoff = await getHistoryCutoffIsoForUser(userId);

  const supabase = await createMargeoServerClient();
  let query = supabase
    .from("margeo_analyses")
    .select("*, ride:margeo_rides(*)")
    .eq("user_id", userId)
    .order("analyzed_at", { ascending: false })
    .limit(limit);

  if (historyCutoff) {
    query = query.gte("analyzed_at", historyCutoff);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row) => {
    const { ride, ...analysis } = row as MargeoAnalysisWithRide & {
      ride: MargeoRideRow;
    };
    return rowToRideAnalysis(analysis as MargeoAnalysisRow, ride);
  });
}

export async function getAnalysisById(
  userId: string,
  analysisId: string,
): Promise<RideAnalysis | null> {
  const supabase = await createMargeoServerClient();
  const { data, error } = await supabase
    .from("margeo_analyses")
    .select("*, ride:margeo_rides(*)")
    .eq("user_id", userId)
    .eq("id", analysisId)
    .maybeSingle();

  if (error || !data) return null;
  const { ride, ...analysis } = data as MargeoAnalysisWithRide & {
    ride: MargeoRideRow;
  };
  const result = rowToRideAnalysis(analysis as MargeoAnalysisRow, ride);
  const cutoff = await getHistoryCutoffIsoForUser(userId);
  if (cutoff && new Date(result.analyzedAt).getTime() < new Date(cutoff).getTime()) {
    return null;
  }
  return result;
}

export async function saveAnalysis(
  userId: string,
  offer: RideOffer,
  profile: UserProfile,
  opts?: PersistRideOpts,
): Promise<RideAnalysis | null> {
  const result = analyzeOffer(offer, profile);
  // Service role : inserts plus rapides (pas de RLS cookie)
  let supabase;
  try {
    const { getMargeoAdminDb } = await import("../supabase/admin");
    supabase = getMargeoAdminDb();
  } catch {
    supabase = await createMargeoServerClient();
  }
  const rideId = crypto.randomUUID();
  const analysisId = crypto.randomUUID();

  const ridePayload = buildRideInsertPayload(rideId, userId, offer, profile, opts);

  const analysisPayload = {
    id: analysisId,
    user_id: userId,
    ride_id: rideId,
    gross_gain: finiteMoney(result.grossGain),
    estimated_cost: finiteMoney(result.estimatedCost),
    net_gain: finiteMoney(result.netGain),
    hourly_rate: finiteMoney(result.hourlyRate),
    score: finiteScore(result.score),
    verdict: result.verdict,
    explanation: result.explanation ?? "",
    insights: Array.isArray(result.insights) ? result.insights : [],
    score_breakdown: Array.isArray(result.scoreBreakdown)
      ? result.scoreBreakdown
      : [],
    analyzed_at: result.analyzedAt,
  };

  // Ride d'abord (FK). Si le CHECK / schéma prod refuse, retry colonnes socle.
  let { error: rideError } = await supabase
    .from("margeo_rides")
    .insert(ridePayload);

  if (rideError) {
    console.error("[driveely/analyses] ride insert:", rideError.message, rideError.code);
    const fallback = buildRideInsertFallback(ridePayload);
    const retry = await supabase.from("margeo_rides").insert(fallback);
    rideError = retry.error;
    if (rideError) {
      console.error(
        "[driveely/analyses] ride insert fallback:",
        rideError.message,
        rideError.code,
      );
      return null;
    }
  }

  const { error: analysisError } = await supabase
    .from("margeo_analyses")
    .insert(analysisPayload);

  if (analysisError) {
    console.error(
      "[driveely/analyses] analysis insert:",
      analysisError.message,
      analysisError.code,
    );
    await supabase.from("margeo_rides").delete().eq("id", rideId).eq("user_id", userId);
    return null;
  }

  // Retour immédiat depuis le moteur — pas de relecture DB
  return {
    ...result,
    id: analysisId,
    offer: { ...offer, id: rideId },
  };
}

export async function countAnalysesForUser(userId: string): Promise<number> {
  const supabase = await createMargeoServerClient();
  const { count } = await supabase
    .from("margeo_analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}

/**
 * Supprime une analyse appartenant à l'utilisateur :
 * feedback lié (cascade), analyse, ride, capture Storage éventuelle.
 */
export async function deleteAnalysisForUser(
  userId: string,
  analysisId: string,
): Promise<boolean> {
  let supabase;
  try {
    const { getMargeoAdminDb } = await import("../supabase/admin");
    supabase = getMargeoAdminDb();
  } catch {
    supabase = await createMargeoServerClient();
  }

  const { data, error } = await supabase
    .from("margeo_analyses")
    .select("id, ride_id, ride:margeo_rides(id, image_path, user_id)")
    .eq("user_id", userId)
    .eq("id", analysisId)
    .maybeSingle();

  if (error || !data) return false;

  const ride = data.ride as
    | { id: string; image_path: string | null; user_id: string }
    | { id: string; image_path: string | null; user_id: string }[]
    | null;

  const rideRow = Array.isArray(ride) ? ride[0] : ride;
  if (!rideRow || rideRow.user_id !== userId) return false;

  const imagePath = rideRow.image_path;

  const { error: deleteAnalysisError } = await supabase
    .from("margeo_analyses")
    .delete()
    .eq("id", analysisId)
    .eq("user_id", userId);

  if (deleteAnalysisError) {
    console.error(
      "[driveely/analyses] delete analysis:",
      deleteAnalysisError.message,
    );
    return false;
  }

  const { error: deleteRideError } = await supabase
    .from("margeo_rides")
    .delete()
    .eq("id", rideRow.id)
    .eq("user_id", userId);

  if (deleteRideError) {
    console.error("[driveely/analyses] delete ride:", deleteRideError.message);
  }

  if (imagePath) {
    const { deleteScreenshot } = await import("./storage");
    await deleteScreenshot(imagePath);
  }

  return true;
}
