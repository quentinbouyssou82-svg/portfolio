import { NextResponse } from "next/server";
import { jsonError, ApiError } from "@/lib/margeo/api/errors";
import { purgeExpiredScreenshots } from "@/lib/margeo/services/screenshot-retention";

/**
 * Cron quotidien — purge des captures > 30 jours.
 * Auth : header `Authorization: Bearer ${CRON_SECRET}`
 * (Vercel Cron envoie automatiquement ce header si CRON_SECRET est défini).
 */
function assertCronAuth(request: Request): void {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    throw new ApiError(
      "CRON_SECRET non configuré.",
      503,
      "CRON_NOT_CONFIGURED",
    );
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    throw new ApiError("Non autorisé", 401, "UNAUTHORIZED");
  }
}

async function handle(request: Request) {
  assertCronAuth(request);
  const result = await purgeExpiredScreenshots();
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (error) {
    return jsonError(error);
  }
}
