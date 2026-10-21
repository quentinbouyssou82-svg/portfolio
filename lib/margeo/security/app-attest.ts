/**
 * Apple App Attest — challenge + vérification d'assertion (log_only → strict).
 * Objectif : rejeter les requêtes qui ne viennent pas d'une app iOS authentique.
 *
 * Phase log_only : journalise présence/absence/échec sans bloquer.
 * Phase strict : exige keyId + assertion + challenge valides.
 *
 * Note : la vérification crypto complète (chaîne de certificats Apple + CBOR)
 * nécessite APP_ATTEST_TEAM_ID + clés enregistrées. Tant que non configuré,
 * on valide la structure + binding du challenge (anti-replay).
 */

import { createHash, randomBytes } from "crypto";
import { getRedis } from "@/lib/margeo/redis/client";
import {
  parseEnforcementMode,
  type SecurityEnforcementMode,
} from "./enforcement-mode";

const CHALLENGE_TTL_SEC = 300;
const memoryChallenges = new Map<string, { exp: number; userId?: string }>();
const memoryKeys = new Map<string, { userId: string; registeredAt: number }>();

export type AppAttestConfig = {
  mode: SecurityEnforcementMode;
  enabled: boolean;
  teamId: string | null;
  bundleId: string;
};

export function getAppAttestConfig(): AppAttestConfig {
  const enabled =
    process.env.APP_ATTEST_ENABLED === "true" ||
    process.env.APP_ATTEST_ENABLED === "1";
  return {
    mode: parseEnforcementMode(process.env.APP_ATTEST_MODE, "log_only"),
    enabled,
    teamId: process.env.APPLE_TEAM_ID?.trim() || null,
    bundleId:
      process.env.APPLE_APP_STORE_BUNDLE_ID?.trim() || "app.driveely.ios",
  };
}

function challengeKey(challenge: string): string {
  return `driveely:attest:chal:${challenge}`;
}

function keyIdKey(keyId: string): string {
  return `driveely:attest:key:${keyId}`;
}

export async function issueAppAttestChallenge(userId?: string): Promise<{
  challenge: string;
  expiresInSec: number;
}> {
  const challenge = randomBytes(32).toString("base64url");
  const redis = getRedis();
  if (redis) {
    await redis.set(challengeKey(challenge), userId ?? "anon", {
      ex: CHALLENGE_TTL_SEC,
    });
  } else {
    memoryChallenges.set(challenge, {
      exp: Date.now() + CHALLENGE_TTL_SEC * 1000,
      userId,
    });
  }
  return { challenge, expiresInSec: CHALLENGE_TTL_SEC };
}

async function consumeChallenge(
  challenge: string,
): Promise<{ ok: boolean; userId?: string }> {
  const redis = getRedis();
  if (redis) {
    const key = challengeKey(challenge);
    const userId = await redis.get<string>(key);
    if (userId == null) return { ok: false };
    await redis.del(key);
    return { ok: true, userId: userId === "anon" ? undefined : userId };
  }

  const entry = memoryChallenges.get(challenge);
  if (!entry || entry.exp < Date.now()) {
    memoryChallenges.delete(challenge);
    return { ok: false };
  }
  memoryChallenges.delete(challenge);
  return { ok: true, userId: entry.userId };
}

export async function registerAppAttestKey(input: {
  keyId: string;
  attestationObjectBase64: string;
  challenge: string;
  userId: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const consumed = await consumeChallenge(input.challenge);
  if (!consumed.ok) {
    return { ok: false, reason: "Challenge invalide ou expiré" };
  }

  const keyId = input.keyId.trim();
  if (!keyId || keyId.length < 8) {
    return { ok: false, reason: "keyId invalide" };
  }

  // Attestation CBOR doit être non vide (vérif crypto complète = Phase 2.1b)
  let decoded: Buffer;
  try {
    decoded = Buffer.from(input.attestationObjectBase64, "base64");
  } catch {
    return { ok: false, reason: "attestationObject non décodable" };
  }
  if (decoded.length < 32) {
    return { ok: false, reason: "attestationObject trop court" };
  }

  const redis = getRedis();
  const payload = JSON.stringify({
    userId: input.userId,
    registeredAt: Date.now(),
  });
  if (redis) {
    await redis.set(keyIdKey(keyId), payload, { ex: 60 * 60 * 24 * 180 });
  } else {
    memoryKeys.set(keyId, {
      userId: input.userId,
      registeredAt: Date.now(),
    });
  }

  console.info("[driveely/security] app_attest_key_registered", {
    keyIdPrefix: keyId.slice(0, 8),
    userId: input.userId.slice(0, 8),
  });

  return { ok: true };
}

export type AppAttestCheckResult = {
  ok: boolean;
  shouldBlock: boolean;
  reason: string;
  mode: SecurityEnforcementMode;
};

function clientDataHash(challenge: string, path: string): string {
  return createHash("sha256")
    .update(`${challenge}:${path}`)
    .digest("base64url");
}

/**
 * Vérifie les headers App Attest sur une requête sensible.
 * Headers attendus :
 * - X-Driveely-Attest-Key-Id
 * - X-Driveely-Attest-Assertion (base64)
 * - X-Driveely-Attest-Challenge
 */
export async function evaluateAppAttestRequest(
  request: Request,
  options?: { path?: string; userId?: string },
): Promise<AppAttestCheckResult> {
  const config = getAppAttestConfig();
  if (!config.enabled) {
    return {
      ok: true,
      shouldBlock: false,
      reason: "app_attest_disabled",
      mode: config.mode,
    };
  }

  const keyId = request.headers.get("x-driveely-attest-key-id")?.trim();
  const assertion = request.headers.get("x-driveely-attest-assertion")?.trim();
  const challenge = request.headers.get("x-driveely-attest-challenge")?.trim();

  if (!keyId || !assertion || !challenge) {
    const result: AppAttestCheckResult = {
      ok: false,
      shouldBlock: config.mode === "strict",
      reason: "missing_attest_headers",
      mode: config.mode,
    };
    console.warn("[driveely/security] app_attest", result);
    return result;
  }

  const consumed = await consumeChallenge(challenge);
  if (!consumed.ok) {
    const result: AppAttestCheckResult = {
      ok: false,
      shouldBlock: config.mode === "strict",
      reason: "invalid_or_expired_challenge",
      mode: config.mode,
    };
    console.warn("[driveely/security] app_attest", result);
    return result;
  }

  const redis = getRedis();
  let registered = false;
  if (redis) {
    registered = (await redis.get(keyIdKey(keyId))) != null;
  } else {
    registered = memoryKeys.has(keyId);
  }

  if (!registered) {
    const result: AppAttestCheckResult = {
      ok: false,
      shouldBlock: config.mode === "strict",
      reason: "unknown_key_id",
      mode: config.mode,
    };
    console.warn("[driveely/security] app_attest", result);
    return result;
  }

  let assertionBuf: Buffer;
  try {
    assertionBuf = Buffer.from(assertion, "base64");
  } catch {
    const result: AppAttestCheckResult = {
      ok: false,
      shouldBlock: config.mode === "strict",
      reason: "assertion_decode_failed",
      mode: config.mode,
    };
    console.warn("[driveely/security] app_attest", result);
    return result;
  }

  if (assertionBuf.length < 16) {
    const result: AppAttestCheckResult = {
      ok: false,
      shouldBlock: config.mode === "strict",
      reason: "assertion_too_short",
      mode: config.mode,
    };
    console.warn("[driveely/security] app_attest", result);
    return result;
  }

  // Binding path (observabilité) — la vérif ECDSA complète vient en Phase 2.1b
  const path = options?.path ?? new URL(request.url).pathname;
  void clientDataHash(challenge, path);

  console.info("[driveely/security] app_attest_ok", {
    keyIdPrefix: keyId.slice(0, 8),
    mode: config.mode,
  });

  return {
    ok: true,
    shouldBlock: false,
    reason: "ok",
    mode: config.mode,
  };
}

export async function assertAppAttestOrThrow(
  request: Request,
  options?: { path?: string; userId?: string },
): Promise<void> {
  const result = await evaluateAppAttestRequest(request, options);
  if (result.shouldBlock) {
    const { ApiError } = await import("@/lib/margeo/api/errors");
    throw new ApiError(
      "App non vérifiée. Mets à jour Driveely depuis l'App Store.",
      403,
      "APP_ATTEST_REQUIRED",
    );
  }
}
