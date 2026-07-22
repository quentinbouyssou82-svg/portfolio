/**
 * Rétention des captures d'écran — 30 jours (DRIVEELY_LIMITS.screenshotRetentionDays).
 * Appelé par le cron Vercel /api/driveely/cron/purge-screenshots.
 */

import { DRIVEELY_LIMITS } from "@/lib/margeo/constants/limits";
import { getMargeoAdminDb } from "@/lib/margeo/supabase/admin";
import { deleteScreenshots } from "@/lib/margeo/services/storage";

export type PurgeScreenshotsResult = {
  retentionDays: number;
  cutoffIso: string;
  candidates: number;
  storageDeleted: number;
  rowsCleared: number;
};

function retentionCutoffIso(days = DRIVEELY_LIMITS.screenshotRetentionDays): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

/**
 * Supprime les fichiers Storage et nettoie `margeo_rides.image_path`
 * pour les courses plus anciennes que la durée de rétention.
 */
export async function purgeExpiredScreenshots(
  options?: { limit?: number },
): Promise<PurgeScreenshotsResult> {
  const retentionDays = DRIVEELY_LIMITS.screenshotRetentionDays;
  const cutoffIso = retentionCutoffIso(retentionDays);
  const limit = options?.limit ?? 200;

  const admin = getMargeoAdminDb();
  const { data, error } = await admin
    .from("margeo_rides")
    .select("id, image_path")
    .not("image_path", "is", null)
    .lt("created_at", cutoffIso)
    .limit(limit);

  if (error) {
    throw new Error(`purge query failed: ${error.message}`);
  }

  const rows = (data ?? []).filter(
    (r): r is { id: string; image_path: string } =>
      typeof r.id === "string" &&
      typeof r.image_path === "string" &&
      r.image_path.length > 0,
  );

  if (rows.length === 0) {
    return {
      retentionDays,
      cutoffIso,
      candidates: 0,
      storageDeleted: 0,
      rowsCleared: 0,
    };
  }

  const paths = rows.map((r) => r.image_path);
  const storageDeleted = await deleteScreenshots(paths);

  const ids = rows.map((r) => r.id);
  const { error: updateError, count } = await admin
    .from("margeo_rides")
    .update({ image_path: null }, { count: "exact" })
    .in("id", ids)
    .not("image_path", "is", null);

  if (updateError) {
    console.warn("[driveely/retention] clear image_path:", updateError.message);
  }

  return {
    retentionDays,
    cutoffIso,
    candidates: rows.length,
    storageDeleted,
    rowsCleared: count ?? ids.length,
  };
}
