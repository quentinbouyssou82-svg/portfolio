import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { checkRateLimit } from "@/lib/margeo/api/rate-limit";
import { validateCoordinates } from "@/lib/margeo/api/validate-image";
import { UBERLY_LIMITS } from "@/lib/margeo/constants/limits";
import { createMargeoServerClient } from "@/lib/margeo/supabase/server";

type GeoPermission = "granted" | "denied" | "unknown";

function parsePermission(value: unknown): GeoPermission {
  if (value === "granted" || value === "denied" || value === "unknown") {
    return value;
  }
  return "unknown";
}

export async function GET() {
  try {
    const user = await requireAuthUser();
    const supabase = await createMargeoServerClient();
    const { data, error } = await supabase
      .from("margeo_profiles")
      .select(
        "last_lat,last_lng,location_permission,location_updated_at,city",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      throw new ApiError("Profil introuvable", 404, "PROFILE_NOT_FOUND");
    }

    return NextResponse.json({
      lat: data.last_lat != null ? Number(data.last_lat) : null,
      lng: data.last_lng != null ? Number(data.last_lng) : null,
      permission: data.location_permission ?? "unknown",
      updatedAt: data.location_updated_at,
      city: data.city,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();

    const limit = checkRateLimit(
      `location:${user.id}`,
      UBERLY_LIMITS.locationRequestsPerHour,
      3_600_000,
    );
    if (!limit.allowed) {
      throw new ApiError(
        "Trop de mises à jour GPS. Réessaie plus tard.",
        429,
        "RATE_LIMITED",
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      throw new ApiError("Corps JSON invalide", 400, "INVALID_JSON");
    }

    const permission = parsePermission(body.permission);
    const lat = Number(body.lat);
    const lng = Number(body.lng);
    const accuracy =
      body.accuracy != null ? Number(body.accuracy) : undefined;

    const supabase = await createMargeoServerClient();

    if (permission === "granted") {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new ApiError("Coordonnées invalides", 400, "INVALID_COORDS");
      }
      validateCoordinates(lat, lng);

      const { error: profileError } = await supabase
        .from("margeo_profiles")
        .update({
          last_lat: lat,
          last_lng: lng,
          location_permission: "granted",
          location_updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        throw new ApiError("Impossible de mettre à jour la position", 500);
      }

      const { error: logError } = await supabase
        .from("margeo_location_logs")
        .insert({
          user_id: user.id,
          lat,
          lng,
          accuracy_m:
            accuracy != null && Number.isFinite(accuracy) ? accuracy : null,
        });

      if (logError) {
        console.warn("[uberly/location] log insert failed:", logError.message);
      }
    } else {
      const { error } = await supabase
        .from("margeo_profiles")
        .update({ location_permission: permission })
        .eq("id", user.id);

      if (error) {
        throw new ApiError("Impossible de mettre à jour les permissions", 500);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
