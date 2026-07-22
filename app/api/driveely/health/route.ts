import { NextResponse } from "next/server";
import { checkDriveelyEnv } from "@/lib/margeo/api/env-check";
import { isDriveelyBetaMode } from "@/lib/margeo/api/beta-config";
import { DRIVEELY_LIMITS } from "@/lib/margeo/constants/limits";

/** Santé backend — sans auth, pour monitoring beta. */
export async function GET() {
  const env = checkDriveelyEnv();

  return NextResponse.json({
    ok: env.readyForBeta,
    betaMode: isDriveelyBetaMode(),
    checks: {
      supabase: env.supabase,
      serviceRole: env.serviceRole,
      vision: env.vision,
      visionProvider: env.visionProvider,
      mistral: env.mistral,
      gemini: env.gemini,
      appUrl: env.appUrl,
    },
    security: {
      storagePrivate: true,
      betaEventsServerOnly: true,
      maxImageMb: DRIVEELY_LIMITS.maxImageBytes / 1024 / 1024,
      freeDailyAnalyses: DRIVEELY_LIMITS.freeDailyAnalyses,
      rateLimitAnalyzePerMin: 20,
      visionKeyServerOnly: true,
    },
    readyForBeta: env.readyForBeta,
    missing: env.missing,
    timestamp: new Date().toISOString(),
  });
}
