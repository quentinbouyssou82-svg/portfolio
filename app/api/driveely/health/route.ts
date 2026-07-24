import { NextResponse } from "next/server";
import { checkDriveelyEnv } from "@/lib/margeo/api/env-check";

/**
 * Santé minimale pour monitoring / uptime.
 * N'expose ni providers, ni flags techniques, ni liste de variables manquantes.
 */
export async function GET() {
  const env = checkDriveelyEnv();
  const ok = env.supabase && env.serviceRole && env.vision;

  return NextResponse.json(
    {
      ok,
      status: ok ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
