import { getMargeoAdminDb } from "../supabase/admin";

const BUCKET = "uberly-screenshots";

export interface UploadScreenshotResult {
  path: string;
  bucket: string;
}

/**
 * Upload sécurisé côté serveur (service_role).
 * Échoue silencieusement si Storage non configuré — l'analyse continue sans image.
 */
export async function uploadScreenshot(
  userId: string,
  file: File,
  ext: string,
): Promise<UploadScreenshotResult | null> {
  try {
    const admin = getMargeoAdminDb();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

    if (error) {
      console.warn("[uberly/storage] upload failed:", error.message);
      return null;
    }

    return { path, bucket: BUCKET };
  } catch (e) {
    console.warn("[uberly/storage] upload skipped:", e);
    return null;
  }
}

/** URL signée temporaire pour consultation interne (admin / debug). */
export async function getScreenshotSignedUrl(
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  try {
    const admin = getMargeoAdminDb();
    const { data, error } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}
