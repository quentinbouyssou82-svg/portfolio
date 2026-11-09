import { NextResponse } from "next/server";
import { ApiError, jsonError } from "@/lib/margeo/api/errors";
import {
  applyFounderBetaCors,
  founderBetaCorsHeaders,
  requireFounderBetaKey,
} from "@/lib/margeo/api/founder-beta";
import { checkRateLimitDistributed } from "@/lib/margeo/api/rate-limit-redis";
import {
  createBetaCodes,
  deactivateBetaCode,
  isCompleteBetaCode,
  listBetaCodes,
  normalizeBetaCode,
} from "@/lib/margeo/services/beta-codes";

function wrap(request: Request, error: unknown): NextResponse {
  return applyFounderBetaCors(jsonError(error), request);
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: founderBetaCorsHeaders(request),
  });
}

export async function GET(request: Request) {
  try {
    requireFounderBetaKey(request);
    const codes = await listBetaCodes();
    return applyFounderBetaCors(NextResponse.json({ ok: true, codes }), request);
  } catch (error) {
    return wrap(request, error);
  }
}

export async function POST(request: Request) {
  try {
    requireFounderBetaKey(request);

    const limit = await checkRateLimitDistributed(
      "beta-codes-create:founder",
      30,
      60_000,
    );
    if (!limit.allowed) {
      throw new ApiError("Trop de créations. Réessaie dans une minute.", 429, "RATE_LIMITED");
    }

    let body: {
      code?: unknown;
      note?: unknown;
      count?: unknown;
      maxUses?: unknown;
      expiresAt?: unknown;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      throw new ApiError("Corps JSON invalide", 400, "VALIDATION");
    }

    const explicit =
      typeof body.code === "string" && body.code.trim()
        ? normalizeBetaCode(body.code)
        : null;
    if (explicit && !isCompleteBetaCode(explicit)) {
      throw new ApiError(
        "Code invalide : 6 caractères A-Z / 0-9 (ex. AB7-KQ2).",
        400,
        "VALIDATION",
      );
    }

    const countRaw = Number(body.count ?? 1);
    const count = Number.isFinite(countRaw) ? Math.floor(countRaw) : 1;
    const maxUsesRaw = Number(body.maxUses ?? 1);
    const maxUses = Number.isFinite(maxUsesRaw) ? Math.floor(maxUsesRaw) : 1;
    const note = typeof body.note === "string" ? body.note : null;
    const expiresAt =
      typeof body.expiresAt === "string" && body.expiresAt.trim()
        ? body.expiresAt
        : null;

    const codes = await createBetaCodes({
      code: explicit,
      count,
      maxUses,
      note,
      expiresAt,
    });

    return applyFounderBetaCors(
      NextResponse.json({ ok: true, codes }, { status: 201 }),
      request,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("duplicate") || message.includes("unique")) {
      return wrap(
        request,
        new ApiError("Ce code existe déjà.", 409, "BETA_CODE_EXISTS"),
      );
    }
    return wrap(request, error);
  }
}

export async function PATCH(request: Request) {
  try {
    requireFounderBetaKey(request);

    let body: { code?: unknown; active?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      throw new ApiError("Corps JSON invalide", 400, "VALIDATION");
    }

    const code = typeof body.code === "string" ? normalizeBetaCode(body.code) : "";
    if (!isCompleteBetaCode(code)) {
      throw new ApiError("Code invalide", 400, "VALIDATION");
    }

    if (body.active !== false) {
      throw new ApiError("Seul le retrait (active: false) est supporté.", 400, "VALIDATION");
    }

    const ok = await deactivateBetaCode(code);
    if (!ok) {
      throw new ApiError("Code introuvable", 404, "NOT_FOUND");
    }

    return applyFounderBetaCors(
      NextResponse.json({ ok: true, code, active: false }),
      request,
    );
  } catch (error) {
    return wrap(request, error);
  }
}
