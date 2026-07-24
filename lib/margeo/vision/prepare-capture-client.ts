/**
 * Compression navigateur avant upload — réduit le temps réseau + Sharp + Mistral
 * sur les photos perso (souvent 2–8 Mo vs captures d'écran légères).
 * HEIC/HEIF : laissé au serveur (Sharp).
 */

const MAX_EDGE = 768;
const JPEG_QUALITY = 0.62;
/** Déjà assez léger → pas de re-encode inutile. */
const SKIP_UNDER_BYTES = 380_000;

export async function prepareCaptureForUpload(file: File): Promise<File> {
  if (typeof window === "undefined") return file;

  const mime = (file.type || "").toLowerCase();
  if (mime.includes("heic") || mime.includes("heif")) return file;

  if (
    file.size <= SKIP_UNDER_BYTES &&
    (mime === "image/jpeg" || mime === "image/jpg" || mime === "image/webp")
  ) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_EDGE / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );

    if (!blob || blob.size === 0) return file;
    // Si le re-encode grossit le fichier, garder l'original
    if (blob.size >= file.size * 0.95) return file;

    const base = file.name.replace(/\.[^.]+$/, "") || "capture";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
