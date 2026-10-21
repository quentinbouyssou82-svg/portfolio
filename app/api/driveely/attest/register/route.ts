import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { registerAppAttestKey } from "@/lib/margeo/security/app-attest";
import { checkRateLimitDistributed } from "@/lib/margeo/api/rate-limit-redis";

/** POST — enregistre une clé App Attest après attestation hardware. */
export async function POST(request: Request) {
  try {
    const user = await requireAuthUser();

    const limit = await checkRateLimitDistributed(
      `attest-register:${user.id}`,
      10,
      60_000,
    );
    if (!limit.allowed) {
      throw new ApiError("Trop de tentatives d'attestation.", 429, "RATE_LIMITED");
    }

    const body = (await request.json().catch(() => ({}))) as {
      keyId?: string;
      attestationObject?: string;
      challenge?: string;
    };

    if (!body.keyId || !body.attestationObject || !body.challenge) {
      throw new ApiError(
        "keyId, attestationObject et challenge requis.",
        400,
        "INVALID_ATTEST_PAYLOAD",
      );
    }

    const result = await registerAppAttestKey({
      keyId: body.keyId,
      attestationObjectBase64: body.attestationObject,
      challenge: body.challenge,
      userId: user.id,
    });

    if (!result.ok) {
      throw new ApiError(result.reason, 400, "ATTEST_REGISTER_FAILED");
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
