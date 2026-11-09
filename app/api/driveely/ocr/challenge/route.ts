import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { requireAuthUser } from "@/lib/margeo/api/auth";
import { issueOcrChallenge } from "@/lib/margeo/security/ocr-trust";
import { checkRateLimitDistributed } from "@/lib/margeo/api/rate-limit-redis";

/** POST — challenge one-shot pour binding OCR (anti-replay). */
export async function POST() {
  try {
    const user = await requireAuthUser();
    const rl = await checkRateLimitDistributed(
      `ocr-challenge:${user.id}`,
      30,
      60_000,
    );
    if (!rl.allowed) {
      throw new ApiError(
        "Trop de défis OCR. Réessaie dans une minute.",
        429,
        "RATE_LIMITED",
      );
    }
    const issued = await issueOcrChallenge(user.id);
    return NextResponse.json(issued);
  } catch (error) {
    return jsonError(error);
  }
}
