import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { exportPersonalData } from "@/lib/margeo/services/account";
import { checkRateLimitDistributed } from "@/lib/margeo/api/rate-limit-redis";

/** GET — export JSON des données personnelles (portabilité RGPD). */
export async function GET() {
  try {
    const user = await requireAuthUser();

    const limit = await checkRateLimitDistributed(
      `account-export:${user.id}`,
      5,
      3_600_000,
    );
    if (!limit.allowed) {
      throw new ApiError(
        "Trop d'exports. Réessaie plus tard.",
        429,
        "RATE_LIMITED",
      );
    }

    const data = await exportPersonalData(user.id);

    return NextResponse.json(data, {
      headers: {
        "Content-Disposition": `attachment; filename="driveely-export-${user.id.slice(0, 8)}.json"`,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
