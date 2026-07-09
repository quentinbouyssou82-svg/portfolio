import type { MargeoFeedbackRow } from "../supabase/schema";
import { createMargeoServerClient } from "../supabase/server";

export interface FeedbackInput {
  analysisId: string;
  accepted: boolean;
  actualDurationMin?: number;
  actualGain?: number;
  actualDistanceKm?: number;
}

export async function getFeedbackForAnalysis(
  userId: string,
  analysisId: string,
): Promise<MargeoFeedbackRow | null> {
  const supabase = await createMargeoServerClient();
  const { data } = await supabase
    .from("margeo_feedback")
    .select("*")
    .eq("user_id", userId)
    .eq("analysis_id", analysisId)
    .maybeSingle();

  return (data as MargeoFeedbackRow) ?? null;
}

export async function saveFeedback(
  userId: string,
  input: FeedbackInput,
): Promise<MargeoFeedbackRow | null> {
  const supabase = await createMargeoServerClient();

  const { data, error } = await supabase
    .from("margeo_feedback")
    .upsert(
      {
        analysis_id: input.analysisId,
        user_id: userId,
        accepted: input.accepted,
        actual_duration_min: input.actualDurationMin ?? null,
        actual_gain: input.actualGain ?? null,
        actual_distance_km: input.actualDistanceKm ?? null,
      },
      { onConflict: "analysis_id" },
    )
    .select("*")
    .single();

  if (error || !data) return null;
  return data as MargeoFeedbackRow;
}
