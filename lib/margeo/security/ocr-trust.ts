/**
 * Confiance OCR on-device — le serveur ne croit jamais un JSON client seul.
 *
 * Modes (DRIVEELY_OCR_TRUST_MODE) :
 * - revalidate (défaut) : image obligatoire → Vision = source de vérité
 * - bound : skip Vision seulement si challenge one-shot + binding + (attest si exigé)
 * - off : ignore source=on_device_ocr, Vision classique
 *
 * Skip Mistral : DRIVEELY_OCR_ALLOW_SKIP=true ET mode=bound ET preuves OK.
 * Une App Attest « enabled » sans binding payload ≠ confiance OCR.
 */

import { createHash, randomBytes } from "crypto";
import { getRedis } from "@/lib/margeo/redis/client";
import {
  parseEnforcementMode,
  type SecurityEnforcementMode,
} from "./enforcement-mode";
import type { AppAttestCheckResult } from "./app-attest";

const OCR_CHALLENGE_TTL_SEC = 300;
const memoryOcrChallenges = new Map<string, { exp: number; userId?: string }>();

export type OcrTrustMode = "off" | "revalidate" | "bound";

export type OcrTrustAction = "accept" | "revalidate" | "reject";

export type OcrTrustEvent =
  | "ocr_accepted"
  | "ocr_rejected"
  | "ocr_revalidated"
  | "app_attest_absent"
  | "app_attest_invalid"
  | "proof_invalid"
  | "replay_detected"
  | "inconsistency_detected"
  | "fallback_vision"
  | "ocr_weak"
  | "ocr_image_required";

export type OcrTrustConfig = {
  mode: OcrTrustMode;
  allowSkip: boolean;
  requireAttestForSkip: boolean;
  minConfidence: number;
  /** Tolérance absolue € pour comparer OCR proposé vs Vision */
  payoutToleranceEur: number;
  appMode: string;
};

export type OcrTrustInput = {
  sourceField: string;
  ocrPayload: string | null;
  hasImage: boolean;
  imageSha256: string | null;
  ocrChallenge: string | null;
  ocrBinding: string | null;
  attest: AppAttestCheckResult;
  attestEnabled: boolean;
};

export type OcrTrustDecision = {
  action: OcrTrustAction;
  useClientOcr: boolean;
  events: OcrTrustEvent[];
  reason: string;
  clientConfidence: number | null;
  proposedPayout: number | null;
  config: OcrTrustConfig;
};

function parseTrustMode(raw: string | undefined): OcrTrustMode {
  const v = raw?.trim().toLowerCase();
  if (v === "bound" || v === "attest_bound" || v === "authenticated") {
    return "bound";
  }
  if (v === "off" || v === "disabled" || v === "ignore") return "off";
  if (v === "revalidate" || v === "verify" || v === "vision") return "revalidate";
  // Défaut sécurisé : jamais de skip Mistral sur JSON client nu
  return "revalidate";
}

export function getOcrTrustConfig(): OcrTrustConfig {
  const allowSkip =
    process.env.DRIVEELY_OCR_ALLOW_SKIP === "true" ||
    process.env.DRIVEELY_OCR_ALLOW_SKIP === "1";
  const appMode = (process.env.NEXT_PUBLIC_APP_MODE ?? "production").trim();
  const requireAttestRaw = process.env.DRIVEELY_OCR_REQUIRE_ATTEST_FOR_SKIP;
  const requireAttestForSkip =
    requireAttestRaw === "false" || requireAttestRaw === "0"
      ? false
      : requireAttestRaw === "true" || requireAttestRaw === "1"
        ? true
        : // prod / beta : skip sans attest interdit ; développement local optionnel
          appMode !== "development";

  const minConfidence = Number(process.env.DRIVEELY_OCR_MIN_CONFIDENCE ?? 85);
  const payoutToleranceEur = Number(
    process.env.DRIVEELY_OCR_PAYOUT_TOLERANCE_EUR ?? 0.05,
  );

  return {
    mode: parseTrustMode(process.env.DRIVEELY_OCR_TRUST_MODE),
    allowSkip,
    requireAttestForSkip,
    minConfidence: Number.isFinite(minConfidence) ? minConfidence : 85,
    payoutToleranceEur: Number.isFinite(payoutToleranceEur)
      ? payoutToleranceEur
      : 0.05,
    appMode,
  };
}

function ocrChallengeKey(challenge: string): string {
  return `driveely:ocr:chal:${challenge}`;
}

export async function issueOcrChallenge(userId?: string): Promise<{
  challenge: string;
  expiresInSec: number;
}> {
  const challenge = randomBytes(32).toString("base64url");
  const redis = getRedis();
  if (redis) {
    await redis.set(ocrChallengeKey(challenge), userId ?? "anon", {
      ex: OCR_CHALLENGE_TTL_SEC,
    });
  } else {
    memoryOcrChallenges.set(challenge, {
      exp: Date.now() + OCR_CHALLENGE_TTL_SEC * 1000,
      userId,
    });
  }
  return { challenge, expiresInSec: OCR_CHALLENGE_TTL_SEC };
}

export async function consumeOcrChallenge(
  challenge: string,
): Promise<{ ok: boolean; reason: "ok" | "missing" | "replay_or_expired" }> {
  const redis = getRedis();
  if (redis) {
    const key = ocrChallengeKey(challenge);
    const userId = await redis.get<string>(key);
    if (userId == null) return { ok: false, reason: "replay_or_expired" };
    await redis.del(key);
    return { ok: true, reason: "ok" };
  }

  const entry = memoryOcrChallenges.get(challenge);
  if (!entry) return { ok: false, reason: "replay_or_expired" };
  if (entry.exp < Date.now()) {
    memoryOcrChallenges.delete(challenge);
    return { ok: false, reason: "replay_or_expired" };
  }
  memoryOcrChallenges.delete(challenge);
  return { ok: true, reason: "ok" };
}

/** Pour tests unitaires — reset store mémoire. */
export function __resetOcrChallengeMemoryForTests(): void {
  memoryOcrChallenges.clear();
}

export function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Binding = SHA-256 hex de :
 *   challenge + "\n" + imageSha256 + "\n" + ocrPayloadExact
 */
export function computeOcrBinding(
  challenge: string,
  imageSha256: string,
  ocrPayloadExact: string,
): string {
  return sha256Hex(`${challenge}\n${imageSha256}\n${ocrPayloadExact}`);
}

export function parseProposedOcrMeta(ocrPayload: string): {
  confidence: number | null;
  payout: number | null;
} {
  try {
    const json = JSON.parse(ocrPayload) as Record<string, unknown>;
    const conf =
      typeof json.confidence === "number" && Number.isFinite(json.confidence)
        ? Math.max(0, Math.min(100, json.confidence))
        : null;
    const rawPayout = json.price_eur ?? json.payout;
    const payout =
      typeof rawPayout === "number" && Number.isFinite(rawPayout)
        ? rawPayout
        : null;
    return { confidence: conf, payout };
  } catch {
    return { confidence: null, payout: null };
  }
}

export function payoutsConsistent(
  proposed: number | null,
  vision: number,
  toleranceEur: number,
): boolean {
  if (proposed == null || !Number.isFinite(proposed)) return false;
  return Math.abs(proposed - vision) <= toleranceEur;
}

export function logOcrTrustEvent(
  event: OcrTrustEvent,
  meta: Record<string, unknown>,
): void {
  // Jamais d'image ni de PII — meta déjà anonymisé côté appelant
  console.info("[driveely/security] ocr_trust", { event, ...meta });
}

/**
 * Décision pure (sauf consommation challenge async) : peut-on faire confiance à l'OCR client ?
 */
export async function resolveOcrTrust(
  input: OcrTrustInput,
  config: OcrTrustConfig = getOcrTrustConfig(),
): Promise<OcrTrustDecision> {
  const events: OcrTrustEvent[] = [];
  const wantsOcr =
    input.sourceField === "on_device_ocr" &&
    input.ocrPayload != null &&
    input.ocrPayload.length > 0;

  if (!wantsOcr) {
    return {
      action: "revalidate",
      useClientOcr: false,
      events: [],
      reason: "not_ocr_request",
      clientConfidence: null,
      proposedPayout: null,
      config,
    };
  }

  const meta = parseProposedOcrMeta(input.ocrPayload!);
  const base = {
    clientConfidence: meta.confidence,
    proposedPayout: meta.payout,
    config,
  };

  if (config.mode === "off") {
    events.push("fallback_vision");
    return {
      action: "revalidate",
      useClientOcr: false,
      events,
      reason: "ocr_trust_mode_off",
      ...base,
    };
  }

  if (!input.hasImage || !input.imageSha256) {
    events.push("ocr_image_required", "ocr_rejected");
    return {
      action: "reject",
      useClientOcr: false,
      events,
      reason: "ocr_image_required",
      ...base,
    };
  }

  if (
    meta.confidence == null ||
    meta.confidence < config.minConfidence
  ) {
    events.push("ocr_weak", "fallback_vision", "ocr_revalidated");
    return {
      action: "revalidate",
      useClientOcr: false,
      events,
      reason: "ocr_confidence_below_threshold",
      ...base,
    };
  }

  // Mode revalidate : jamais de skip — Vision reste la vérité
  if (config.mode === "revalidate" || !config.allowSkip) {
    events.push("fallback_vision", "ocr_revalidated");
    return {
      action: "revalidate",
      useClientOcr: false,
      events,
      reason:
        config.mode === "revalidate"
          ? "ocr_revalidate_mode"
          : "ocr_skip_disabled",
      ...base,
    };
  }

  // --- mode bound + allowSkip ---
  if (!input.ocrChallenge || !input.ocrBinding) {
    events.push("proof_invalid", "fallback_vision", "ocr_revalidated");
    return {
      action: "revalidate",
      useClientOcr: false,
      events,
      reason: "ocr_proof_missing",
      ...base,
    };
  }

  const consumed = await consumeOcrChallenge(input.ocrChallenge);
  if (!consumed.ok) {
    events.push("replay_detected", "ocr_rejected");
    return {
      action: "reject",
      useClientOcr: false,
      events,
      reason: "ocr_challenge_replay_or_expired",
      ...base,
    };
  }

  const expected = computeOcrBinding(
    input.ocrChallenge,
    input.imageSha256,
    input.ocrPayload!,
  );
  if (
    expected.length !== input.ocrBinding.length ||
    !timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(input.ocrBinding, "utf8"),
    )
  ) {
    // Constant-time compare on hex strings of equal length; if length differs, reject
    events.push("proof_invalid", "ocr_rejected");
    return {
      action: "reject",
      useClientOcr: false,
      events,
      reason: "ocr_binding_mismatch",
      ...base,
    };
  }

  if (config.requireAttestForSkip) {
    if (!input.attestEnabled) {
      events.push("app_attest_absent", "fallback_vision", "ocr_revalidated");
      return {
        action: "revalidate",
        useClientOcr: false,
        events,
        reason: "app_attest_required_but_disabled",
        ...base,
      };
    }
    if (input.attest.reason === "missing_attest_headers") {
      events.push("app_attest_absent", "ocr_rejected");
      const reject =
        input.attest.mode === "strict" || config.requireAttestForSkip;
      return {
        action: reject ? "reject" : "revalidate",
        useClientOcr: false,
        events: reject
          ? events
          : [...events.filter((e) => e !== "ocr_rejected"), "fallback_vision", "ocr_revalidated"],
        reason: "app_attest_absent",
        ...base,
      };
    }
    if (!input.attest.ok) {
      events.push("app_attest_invalid", "ocr_rejected");
      return {
        action: "reject",
        useClientOcr: false,
        events,
        reason: `app_attest_${input.attest.reason}`,
        ...base,
      };
    }
  }

  events.push("ocr_accepted");
  return {
    action: "accept",
    useClientOcr: true,
    events,
    reason: "ocr_bound_ok",
    ...base,
  };
}

/** Compare timing-safe sans importer crypto timingSafeEqual pour strings hex. */
import { timingSafeEqual } from "crypto";

export function ocrTrustToApiError(decision: OcrTrustDecision): {
  message: string;
  status: number;
  code: string;
} | null {
  if (decision.action !== "reject") return null;

  switch (decision.reason) {
    case "ocr_image_required":
      return {
        message:
          "Image requise pour valider l'extraction locale. Renvoie la capture.",
        status: 400,
        code: "OCR_IMAGE_REQUIRED",
      };
    case "ocr_challenge_replay_or_expired":
      return {
        message: "Preuve OCR expirée ou déjà utilisée. Relance l'analyse.",
        status: 403,
        code: "OCR_REPLAY_DETECTED",
      };
    case "ocr_binding_mismatch":
      return {
        message: "Preuve OCR invalide. Relance l'analyse depuis l'app.",
        status: 403,
        code: "OCR_PROOF_INVALID",
      };
    case "app_attest_absent":
      return {
        message: "App non vérifiée. Mets à jour Driveely depuis l'App Store.",
        status: 403,
        code: "APP_ATTEST_REQUIRED",
      };
    default:
      if (decision.reason.startsWith("app_attest_")) {
        return {
          message: "App non vérifiée. Mets à jour Driveely depuis l'App Store.",
          status: 403,
          code: "APP_ATTEST_INVALID",
        };
      }
      return {
        message: "Extraction locale refusée. Réessaie avec une nouvelle capture.",
        status: 403,
        code: "OCR_REJECTED",
      };
  }
}

export type { SecurityEnforcementMode };
