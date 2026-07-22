/** Géocodage léger (Nominatim OSM) + calcul distance Haversine. */

export interface Coordinates {
  lat: number;
  lng: number;
}

export function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/** Géocode une adresse en France via Nominatim (usage modéré). */
export async function geocodeAddress(
  query: string,
  cityHint?: string,
): Promise<Coordinates | null> {
  const q = cityHint ? `${query}, ${cityHint}, France` : `${query}, France`;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Driveely/1.0 (delivery-copilot)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export async function distanceToPickupKm(
  courier: Coordinates,
  pickupAddress: string,
  city?: string,
): Promise<number | null> {
  const pickup = await geocodeAddress(pickupAddress, city);
  if (!pickup) return null;
  return Math.round(haversineKm(courier, pickup) * 100) / 100;
}
