import { betaLog } from "../api/beta-config";

export type BetaEventType =
  | "account_created"
  | "onboarding_completed"
  | "first_analysis"
  | "analysis_started"
  | "analysis_success"
  | "analysis_failed"
  | "vision_low_confidence"
  | "feedback_submitted"
  | "feedback_correction"
  | "paywall_view"
  | "paywall_screen"
  | "paywall_cta_click"
  | "paywall_trial_start"
  | "paywall_exit_offer"
  | "paywall_dismiss";

export interface BetaEventInput {
  userId: string;
  eventType: BetaEventType;
  analysisId?: string;
  durationMs?: number;
  visionSource?: "mock" | "vision";
  visionConfidence?: number;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

export async function logBetaEvent(input: BetaEventInput): Promise<void> {
  betaLog("event", input.eventType, {
    userId: input.userId,
    analysisId: input.analysisId,
    errorCode: input.errorCode,
  });

  try {
    const { getMargeoAdminDb } = await import("../supabase/admin");
    const admin = getMargeoAdminDb();

    const { error } = await admin.from("margeo_beta_events").insert({
      user_id: input.userId,
      event_type: input.eventType,
      analysis_id: input.analysisId ?? null,
      duration_ms: input.durationMs ?? null,
      vision_source: input.visionSource ?? null,
      vision_confidence: input.visionConfidence ?? null,
      error_code: input.errorCode ?? null,
      metadata: input.metadata ?? {},
    });

    if (error) {
      console.warn("[driveely/beta-events] insert failed:", error.message);
    }
  } catch (e) {
    console.warn("[driveely/beta-events] log skipped:", e);
  }
}

/** Évite les doublons first_analysis par utilisateur. */
export async function logFirstAnalysisIfNeeded(
  userId: string,
  analysisId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const { getMargeoAdminDb } = await import("../supabase/admin");
    const admin = getMargeoAdminDb();

    const { count } = await admin
      .from("margeo_beta_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("event_type", "first_analysis");

    if ((count ?? 0) > 0) return;

    await logBetaEvent({
      userId,
      eventType: "first_analysis",
      analysisId,
      metadata,
    });
  } catch {
    // non bloquant
  }
}
