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

export function validateScreenshotFile(file: File): { ext: string } {
  if (file.size === 0) {
    throw new ApiError("Image vide", 400, "EMPTY_IMAGE");
  }

  if (file.size > DRIVEELY_LIMITS.maxImageBytes) {
    throw new ApiError(
      `Image trop lourde (max ${Math.round(DRIVEELY_LIMITS.maxImageBytes / 1024 / 1024)} Mo)`,
      413,
      "IMAGE_TOO_LARGE",
    );
  }

  const mime = file.type.toLowerCase() || "image/jpeg";
  if (!ALLOWED_MIME.has(mime)) {
    throw new ApiError(
      "Format non supporté. Utilise JPEG, PNG ou WebP.",
      415,
      "UNSUPPORTED_FORMAT",
    );
  }

  return { ext: EXT_BY_MIME[mime] ?? "jpg" };
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
