import { NextResponse } from "next/server";
import { ApiError, jsonError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { checkRateLimitDistributed } from "@/lib/margeo/api/rate-limit-redis";
import { redeemBetaCodeForUser } from "@/lib/margeo/services/beta-codes";
import { logBetaEvent } from "@/lib/margeo/services/beta-events";

/**
 * POST /api/driveely/beta/redeem
 * Body: { code: string }
 * Auth required. Marks user is_beta_tester (Elite / effectivePremium).
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();

    const limit = await checkRateLimitDistributed(
      `beta-redeem:${user.id}`,
      10,
      60_000,
    );
    if (!limit.allowed) {
      throw new ApiError("Trop de tentatives. Réessaie dans une minute.", 429, "RATE_LIMITED");
    }

    let body: { code?: unknown };
    try {
      body = (await request.json()) as { code?: unknown };
    } catch {
      throw new ApiError("Corps JSON invalide", 400, "VALIDATION");
    }

    const code = typeof body.code === "string" ? body.code : "";
    const result = await redeemBetaCodeForUser(user.id, code);

    if (!result.ok) {
      const messageByCode: Record<string, string> = {
        BETA_CODE_INVALID: "Code invalide",
        BETA_CODE_EXPIRED: "Code expiré",
        BETA_CODE_ALREADY_USED: "Code déjà utilisé",
        BETA_CODE_UNAVAILABLE: "Code temporairement indisponible",
        UNAUTHORIZED: "Non authentifié",
      };
      const status =
        result.error === "UNAUTHORIZED"
          ? 401
          : result.error === "BETA_CODE_UNAVAILABLE"
            ? 503
            : 400;
      throw new ApiError(
        messageByCode[result.error] ?? "Code invalide",
        status,
        result.error,
      );
    }

    void logBetaEvent({
      userId: user.id,
      eventType: "beta_joined",
      metadata: {
        source: "beta_code_redeem",
        already: result.already,
      },
    });

    return NextResponse.json({ ok: true, already: result.already });
  } catch (error) {
    return jsonError(error);
  }
}
