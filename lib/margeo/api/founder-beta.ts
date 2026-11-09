import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ApiError } from "./errors";

const DEFAULT_PILOT_ORIGINS = [
  "https://driveely-pilot.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

function allowedPilotOrigins(): Set<string> {
  const extra = (process.env.DRIVEELY_PILOT_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_PILOT_ORIGINS, ...extra]);
}

export function founderBetaCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-driveely-founder-key",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin && allowedPilotOrigins().has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export function applyFounderBetaCors(
  response: NextResponse,
  request: Request,
): NextResponse {
  for (const [key, value] of Object.entries(founderBetaCorsHeaders(request))) {
    response.headers.set(key, value);
  }
  return response;
}

export function requireFounderBetaKey(request: Request): void {
  const secret = process.env.DRIVEELY_FOUNDER_BETA_KEY?.trim();
  if (!secret) {
    throw new ApiError(
      "DRIVEELY_FOUNDER_BETA_KEY non configuré.",
      503,
      "FOUNDER_KEY_MISSING",
    );
  }

  const fromHeader = request.headers.get("x-driveely-founder-key")?.trim() ?? "";
  const auth = request.headers.get("authorization") ?? "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const provided = fromHeader || bearer;
  const left = Buffer.from(provided, "utf8");
  const right = Buffer.from(secret, "utf8");
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new ApiError("Non autorisé", 401, "UNAUTHORIZED");
  }
}
