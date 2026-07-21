import { getMargeoAdminDb } from "../supabase/admin";

const SCREENSHOT_BUCKET = "uberly-screenshots";
const AVATAR_BUCKET = "uberly-avatars";

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
    const buffer = Buffer.from(await file.arrayBuffer());
    return uploadScreenshotBuffer(
      userId,
      buffer,
      ext,
      file.type || "image/jpeg",
    );
  } catch (e) {
    console.warn("[uberly/storage] upload skipped:", e);
    return null;
  }
}

/** Upload depuis Buffer déjà préparé (évite File → arrayBuffer). */
export async function uploadScreenshotBuffer(
  userId: string,
  buffer: Buffer,
  ext: string,
  contentType = "image/jpeg",
): Promise<UploadScreenshotResult | null> {
  try {
    const admin = getMargeoAdminDb();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await admin.storage
      .from(SCREENSHOT_BUCKET)
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.warn("[uberly/storage] upload failed:", error.message);
      return null;
    }

    return { path, bucket: SCREENSHOT_BUCKET };
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
      .from(SCREENSHOT_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

export interface UploadAvatarResult {
  path: string;
  publicUrl: string;
}

/**
 * Upload avatar profil (bucket public uberly-avatars).
 * Chemin stable `{userId}/avatar.{ext}` — upsert pour remplacer l'ancienne photo.
 */
export async function uploadAvatar(
  userId: string,
  file: File,
  ext: string,
): Promise<UploadAvatarResult | null> {
  try {
    const admin = getMargeoAdminDb();
    const path = `${userId}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage.from(AVATAR_BUCKET).upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
      cacheControl: "3600",
    });

    if (error) {
      console.warn("[uberly/storage] avatar upload failed:", error.message);
      return null;
    }

    const { data } = admin.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    if (!data?.publicUrl) return null;

    const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
    return { path, publicUrl };
  } catch (e) {
    console.warn("[uberly/storage] avatar upload skipped:", e);
    return null;
  }
}
