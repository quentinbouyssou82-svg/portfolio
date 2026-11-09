/**
 * Géocodage + routing Mapbox (Phase 4).
 * Fallback silencieux vers Nominatim/OSRM si MAPBOX_ACCESS_TOKEN absent ou erreur.
 */

import type { Coordinates } from "../geo";

const GEOCODE_TIMEOUT_MS = 1_100;
const ROUTING_TIMEOUT_MS = 700;

export function isMapboxConfigured(): boolean {
  return Boolean(process.env.MAPBOX_ACCESS_TOKEN?.trim());
}

export async function mapboxGeocode(
  query: string,
  cityHint?: string,
  bias?: Coordinates,
): Promise<Array<{ lat: string; lon: string }> | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN?.trim();
  if (!token) return null;

  const q = cityHint ? `${query}, ${cityHint}, France` : `${query}, France`;
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("country", "fr");
  url.searchParams.set("limit", "3");
  url.searchParams.set("language", "fr");
  if (bias) {
    url.searchParams.set("proximity", `${bias.lng},${bias.lat}`);
  }

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(GEOCODE_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      features?: Array<{ center?: [number, number] }>;
    };
    const features = json.features ?? [];
    if (features.length === 0) return null;
    return features
      .filter((f) => f.center && f.center.length >= 2)
      .map((f) => ({
        lon: String(f.center![0]),
        lat: String(f.center![1]),
      }));
  } catch {
    return null;
  }
}

export async function mapboxRoute(
  from: Coordinates,
  to: Coordinates,
  profile: "driving" | "cycling",
): Promise<{ distanceKm: number; durationMin: number } | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN?.trim();
  if (!token) return null;

  const mapboxProfile =
    profile === "cycling" ? "mapbox/cycling" : "mapbox/driving";
  const url = new URL(
    `https://api.mapbox.com/directions/v5/${mapboxProfile}/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("overview", "false");
  url.searchParams.set("alternatives", "false");

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(ROUTING_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      routes?: Array<{ distance: number; duration: number }>;
    };
    const route = json.routes?.[0];
    if (!route || !Number.isFinite(route.distance)) return null;
    return {
      distanceKm: Math.round((route.distance / 1000) * 100) / 100,
      durationMin: Math.max(1, Math.round(route.duration / 60)),
    };
  } catch {
    return null;
  }
}
