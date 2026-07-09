import { NextResponse } from "next/server";
import { checkUberlyEnv } from "@/lib/margeo/api/env-check";
import { isUberlyBetaMode } from "@/lib/margeo/api/beta-config";
import { UBERLY_LIMITS } from "@/lib/margeo/constants/limits";

/** Santé backend — sans auth, pour monitoring beta. */
export async function GET() {
  const env = checkUberlyEnv();

  return NextResponse.json({
    ok: env.supabase && env.gemini,
    betaMode: isUberlyBetaMode(),
    checks: {
      supabase: env.supabase,
      serviceRole: env.serviceRole,
      gemini: env.gemini,
      appUrl: env.appUrl,
    },
    security: {
      storagePrivate: true,
      betaEventsServerOnly: true,
      maxImageMb: UBERLY_LIMITS.maxImageBytes / 1024 / 1024,
      freeDailyAnalyses: UBERLY_LIMITS.freeDailyAnalyses,
      rateLimitAnalyzePerMin: 20,
      geminiKeyServerOnly: true,
    },
    readyForBeta: env.readyForBeta,
    missing: env.missing,
    timestamp: new Date().toISOString(),
  });
}
