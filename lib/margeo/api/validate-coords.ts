import { ApiError } from "./errors";

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
