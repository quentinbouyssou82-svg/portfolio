import { analyzeOffer } from "../engine";
import type {
  MargeoAnalysisRow,
  MargeoAnalysisWithRide,
  MargeoRideRow,
} from "../supabase/schema";
import type { RideAnalysis, RideOffer, UserProfile } from "../types";
import { createMargeoServerClient } from "../supabase/server";
import { getProfileForUser } from "./profile";
import { getFreeHistoryCutoffIso } from "./quota";

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
  const profile = await getProfileForUser(userId);
  const historyCutoff = getFreeHistoryCutoffIso(profile);

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
  return rowToRideAnalysis(analysis as MargeoAnalysisRow, ride);
}

export async function saveAnalysis(
  userId: string,
  offer: RideOffer,
  profile: UserProfile,
  opts?: {
    imagePath?: string | null;
    courierLat?: number;
    courierLng?: number;
    visionSource?: "mock" | "vision";
    visionConfidence?: number;
    missingFields?: string[];
    extractionQuality?: "complete" | "partial" | "failed";
  },
): Promise<RideAnalysis | null> {
  const result = analyzeOffer(offer, profile);
  const supabase = await createMargeoServerClient();

  const { data: ride, error: rideError } = await supabase
    .from("margeo_rides")
    .insert({
      user_id: userId,
      platform: offer.platform,
      pickup: offer.pickup,
      dropoff: offer.dropoff,
      payout: offer.payout,
      distance_km: offer.distanceKm ?? null,
      duration_min: offer.durationMin ?? null,
      empty_return_km: offer.emptyReturnKm,
      pickup_distance_km: offer.pickupDistanceKm ?? null,
      courier_lat: opts?.courierLat ?? profile.lastLat ?? null,
      courier_lng: opts?.courierLng ?? profile.lastLng ?? null,
      image_path: opts?.imagePath ?? null,
      vision_source: opts?.visionSource ?? null,
      vision_confidence: opts?.visionConfidence ?? null,
      missing_fields: opts?.missingFields ?? [],
      extraction_quality: opts?.extractionQuality ?? "complete",
    })
    .select("*")
    .single();

  if (rideError || !ride) return null;

  const { data: analysis, error: analysisError } = await supabase
    .from("margeo_analyses")
    .insert({
      user_id: userId,
      ride_id: ride.id,
      gross_gain: result.grossGain,
      estimated_cost: result.estimatedCost,
      net_gain: result.netGain,
      hourly_rate: result.hourlyRate,
      score: result.score,
      verdict: result.verdict,
      explanation: result.explanation,
      insights: result.insights,
      score_breakdown: result.scoreBreakdown,
      analyzed_at: result.analyzedAt,
    })
    .select("*")
    .single();

  if (analysisError || !analysis) return null;
  return rowToRideAnalysis(analysis as MargeoAnalysisRow, ride as MargeoRideRow);
}

export async function countAnalysesForUser(userId: string): Promise<number> {
  const supabase = await createMargeoServerClient();
  const { count } = await supabase
    .from("margeo_analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
  return count ?? 0;
}
