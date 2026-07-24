import sharp, { type Metadata, type Stats } from "sharp";
import { ApiError } from "./errors";
import { DRIVEELY_LIMITS } from "../constants/limits";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

/** Dimensions minimales pour une capture de proposition utilisable. */
const MIN_EDGE_PX = 48;
/** Surface minimale (évite les 1×1 / icônes). */
const MIN_PIXELS = 48 * 48;
/**
 * Image quasi uniforme (blanche / noire / unie) :
 * écart-type de luminosité trop bas → pas une vraie capture UI.
 */
const MIN_CHANNEL_STDEV = 4;

export function validateScreenshotFile(file: File): { ext: string } {
  if (!(file instanceof File)) {
    throw new ApiError("Image requise", 400, "IMAGE_REQUIRED");
  }

  if (file.size === 0) {
    throw new ApiError(
      "Fichier image vide. Reprends une capture de la proposition.",
      400,
      "EMPTY_IMAGE",
    );
  }

  if (file.size < 64) {
    throw new ApiError(
      "Fichier trop petit pour être une image valide.",
      400,
      "EMPTY_IMAGE",
    );
  }

  if (file.size > DRIVEELY_LIMITS.maxImageBytes) {
    throw new ApiError(
      `Image trop lourde (max ${Math.round(DRIVEELY_LIMITS.maxImageBytes / 1024 / 1024)} Mo)`,
      413,
      "IMAGE_TOO_LARGE",
    );
  }

  const mime = (file.type || "").toLowerCase();
  // Certains navigateurs envoient un type vide — on accepte et on vérifie via Sharp.
  if (mime && !ALLOWED_MIME.has(mime) && !mime.startsWith("image/")) {
    throw new ApiError(
      "Format non supporté. Utilise JPEG, PNG ou WebP.",
      415,
      "UNSUPPORTED_FORMAT",
    );
  }
  if (mime && mime.startsWith("image/") && !ALLOWED_MIME.has(mime)) {
    throw new ApiError(
      "Format non supporté. Utilise JPEG, PNG ou WebP.",
      415,
      "UNSUPPORTED_FORMAT",
    );
  }

  return { ext: EXT_BY_MIME[mime] ?? "jpg" };
}

/**
 * Décode et contrôle le contenu réel (corruption, taille, image unie / bruitée).
 * À appeler après validateScreenshotFile — avant Vision / quota lourd.
 */
export async function assertUsableScreenshot(file: File): Promise<Buffer> {
  let input: Buffer;
  try {
    input = Buffer.from(await file.arrayBuffer());
  } catch {
    throw new ApiError(
      "Impossible de lire le fichier. Réessaie avec une autre capture.",
      400,
      "INVALID_IMAGE",
    );
  }

  if (input.byteLength === 0) {
    throw new ApiError("Image vide", 400, "EMPTY_IMAGE");
  }

  let meta: Metadata;
  let stats: Stats;
  try {
    const pipeline = sharp(input, { failOn: "error" });
    meta = await pipeline.metadata();
    stats = await sharp(input, { failOn: "error" }).stats();
  } catch {
    throw new ApiError(
      "Image illisible ou corrompue. Exporte une capture JPEG/PNG nette.",
      422,
      "CORRUPT_IMAGE",
    );
  }

  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (width < MIN_EDGE_PX || height < MIN_EDGE_PX || width * height < MIN_PIXELS) {
    throw new ApiError(
      "Image trop petite. Capture toute la proposition de course.",
      422,
      "IMAGE_TOO_SMALL",
    );
  }

  const channels = stats.channels ?? [];
  if (channels.length > 0) {
    const avgStdev =
      channels.reduce((sum: number, c) => sum + (c.stdev ?? 0), 0) /
      channels.length;
    const avgMean =
      channels.reduce((sum: number, c) => sum + (c.mean ?? 0), 0) /
      channels.length;

    // Presque blanc / noir / unie
    if (avgStdev < MIN_CHANNEL_STDEV) {
      throw new ApiError(
        "Image vide ou uniforme détectée. Envoie une vraie capture de proposition.",
        422,
        "BLANK_IMAGE",
      );
    }

    // Bruit extrême sans structure UI (stdev max + mean médiocre) — heuristique douce
    if (avgStdev > 95 && width < 120 && height < 120) {
      throw new ApiError(
        "Image inexploitable. Reprends une capture lisible de la proposition.",
        422,
        "NOISY_IMAGE",
      );
    }

    // Quasi entièrement blanc
    if (avgMean > 248 && avgStdev < 12) {
      throw new ApiError(
        "Image blanche détectée. Reprends une capture de la proposition.",
        422,
        "BLANK_IMAGE",
      );
    }
  }

  return input;
}

/** Mappe les erreurs Sharp / buffer vers ApiError client-safe. */
export function mapImageProcessingError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  const msg = error instanceof Error ? error.message.toLowerCase() : "";
  if (
    msg.includes("unsupported") ||
    msg.includes("corrupt") ||
    msg.includes("vips") ||
    msg.includes("invalid") ||
    msg.includes("input buffer") ||
    msg.includes("png") ||
    msg.includes("jpeg") ||
    msg.includes("webp")
  ) {
    return new ApiError(
      "Image illisible ou format invalide. Utilise une capture JPEG/PNG.",
      422,
      "CORRUPT_IMAGE",
    );
  }
  return new ApiError(
    "Impossible de préparer l'image. Réessaie avec une autre capture.",
    422,
    "INVALID_IMAGE",
  );
}

export function parseOptionalCoordinate(
  value: FormDataEntryValue | null,
): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

export function validateCoordinates(lat: number, lng: number): void {
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new ApiError("Coordonnées GPS invalides", 400, "INVALID_COORDS");
  }
}
