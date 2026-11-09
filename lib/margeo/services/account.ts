/**
 * Suppression de compte & export RGPD.
 * Utilise service_role uniquement pour les opérations cascade (auth admin + storage).
 */

import { getMargeoAdminDb } from "@/lib/margeo/supabase/admin";
import { writeSecurityAuditLog } from "@/lib/margeo/security/audit-log";

export type PersonalDataExport = {
  exportedAt: string;
  userId: string;
  profile: Record<string, unknown> | null;
  subscription: Record<string, unknown> | null;
  analyses: Record<string, unknown>[];
  rides: Record<string, unknown>[];
  feedback: Record<string, unknown>[];
  survey: Record<string, unknown> | null;
  locationLogs: Record<string, unknown>[];
  betaRedemptions: Record<string, unknown>[];
  productFeedback: Record<string, unknown>[];
  surveyAnswers: Record<string, unknown>[];
};

export async function exportPersonalData(
  userId: string,
): Promise<PersonalDataExport> {
  const admin = getMargeoAdminDb();

  const [
    profile,
    subscription,
    analyses,
    rides,
    feedback,
    survey,
    locationLogs,
    betaRedemptions,
    productFeedback,
    surveyAnswers,
  ] = await Promise.all([
      admin.from("margeo_profiles").select("*").eq("id", userId).maybeSingle(),
      admin
        .from("margeo_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      admin
        .from("margeo_analyses")
        .select("*")
        .eq("user_id", userId)
        .order("analyzed_at", { ascending: false })
        .limit(500),
      admin
        .from("margeo_rides")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(500),
      admin
        .from("margeo_feedback")
        .select("*")
        .eq("user_id", userId)
        .limit(200),
      admin
        .from("margeo_survey_responses")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      admin
        .from("margeo_location_logs")
        .select("*")
        .eq("user_id", userId)
        .limit(200),
      admin
        .from("driveely_beta_code_redemptions")
        .select("*")
        .eq("user_id", userId)
        .limit(50),
      admin
        .from("margeo_product_feedback")
        .select("*")
        .eq("user_id", userId)
        .limit(100),
      admin
        .from("margeo_survey_answers")
        .select("*")
        .eq("user_id", userId)
        .limit(200),
    ]);

  await writeSecurityAuditLog({
    action: "account.export",
    userId,
  });

  return {
    exportedAt: new Date().toISOString(),
    userId,
    profile: (profile.data as Record<string, unknown> | null) ?? null,
    subscription:
      (subscription.data as Record<string, unknown> | null) ?? null,
    analyses: (analyses.data as Record<string, unknown>[] | null) ?? [],
    rides: (rides.data as Record<string, unknown>[] | null) ?? [],
    feedback: (feedback.data as Record<string, unknown>[] | null) ?? [],
    survey: (survey.data as Record<string, unknown> | null) ?? null,
    locationLogs: (locationLogs.data as Record<string, unknown>[] | null) ?? [],
    betaRedemptions:
      (betaRedemptions.data as Record<string, unknown>[] | null) ?? [],
    productFeedback:
      (productFeedback.data as Record<string, unknown>[] | null) ?? [],
    surveyAnswers:
      (surveyAnswers.data as Record<string, unknown>[] | null) ?? [],
  };
}

export async function deleteUserAccount(userId: string): Promise<void> {
  const admin = getMargeoAdminDb();

  // 1. Captures Storage (best-effort)
  try {
    const { data: files } = await admin.storage
      .from("driveely-screenshots")
      .list(userId, { limit: 1000 });
    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      await admin.storage.from("driveely-screenshots").remove(paths);
    }
  } catch (e) {
    console.warn("[driveely/account] storage purge:", e);
  }

  try {
    const avatarPaths = ["jpg", "jpeg", "png", "webp"].map(
      (ext) => `${userId.toLowerCase()}/avatar.${ext}`,
    );
    await admin.storage.from("driveely-avatars").remove(avatarPaths);
  } catch {
    // ignore
  }

  // 2. Tables métier (ordre FK-safe)
  const tables = [
    "margeo_feedback",
    "margeo_analyses",
    "margeo_rides",
    "margeo_subscription_events",
    "margeo_subscriptions",
    "margeo_survey_responses",
    "margeo_product_feedback",
    "margeo_beta_events",
    "margeo_location_logs",
    "driveely_beta_code_redemptions",
    "margeo_survey_answers",
    "margeo_survey_history",
  ] as const;

  for (const table of tables) {
    const { error } = await admin.from(table).delete().eq("user_id", userId);
    if (error && !error.message.includes("does not exist")) {
      console.warn(`[driveely/account] delete ${table}:`, error.message);
    }
  }

  await admin.from("margeo_profiles").delete().eq("id", userId);

  // 3. Auth user
  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    throw new Error(`Suppression auth échouée: ${authError.message}`);
  }

  await writeSecurityAuditLog({
    action: "account.deleted",
    userId,
  });
}
