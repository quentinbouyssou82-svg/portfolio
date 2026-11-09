/**
 * Confiance OCR : un JSON client ne doit jamais devenir la vérité sans preuves.
 * Usage : npx tsx scripts/test-driveely-ocr-trust.ts
 */
import assert from "node:assert/strict";
import {
  __resetOcrChallengeMemoryForTests,
  computeOcrBinding,
  issueOcrChallenge,
  payoutsConsistent,
  resolveOcrTrust,
  sha256Hex,
  type OcrTrustConfig,
} from "../lib/margeo/security/ocr-trust";
import type { AppAttestCheckResult } from "../lib/margeo/security/app-attest";
import { decideAnalyzeExtraction } from "../lib/margeo/security/analyze-ocr-path";

const imageSha = sha256Hex(Buffer.from("fixture-image"));
const forged = JSON.stringify({
  platform: "Uber Eats",
  price_eur: 99.99,
  confidence: 99,
});

const attestDisabled: AppAttestCheckResult = {
  ok: true,
  shouldBlock: false,
  reason: "app_attest_disabled",
  mode: "log_only",
};

const revalidateConfig: OcrTrustConfig = {
  mode: "revalidate",
  allowSkip: false,
  requireAttestForSkip: true,
  minConfidence: 85,
  payoutToleranceEur: 0.05,
  appMode: "production",
};

const boundConfig: OcrTrustConfig = {
  mode: "bound",
  allowSkip: true,
  requireAttestForSkip: true,
  minConfidence: 85,
  payoutToleranceEur: 0.05,
  appMode: "production",
};

function baseInput(
  overrides: Partial<Parameters<typeof resolveOcrTrust>[0]> = {},
): Parameters<typeof resolveOcrTrust>[0] {
  return {
    sourceField: "on_device_ocr",
    ocrPayload: forged,
    hasImage: true,
    imageSha256: imageSha,
    ocrChallenge: null,
    ocrBinding: null,
    attest: attestDisabled,
    attestEnabled: false,
    ...overrides,
  };
}

async function main() {
  __resetOcrChallengeMemoryForTests();

  const defaultMode = await resolveOcrTrust(baseInput());
  assert.equal(defaultMode.useClientOcr, false);
  assert.equal(defaultMode.action, "revalidate");
  console.log("✓ défaut (revalidate) : payload forgé non accepté");

  const noImage = await resolveOcrTrust(
    baseInput({ hasImage: false, imageSha256: null }),
    revalidateConfig,
  );
  assert.equal(noImage.action, "reject");
  assert.equal(noImage.reason, "ocr_image_required");
  assert.equal(noImage.useClientOcr, false);
  console.log("✓ sans image : reject");

  const weak = await resolveOcrTrust(
    baseInput({
      ocrPayload: JSON.stringify({ price_eur: 12.4, confidence: 40 }),
    }),
    revalidateConfig,
  );
  assert.equal(weak.useClientOcr, false);
  assert.equal(weak.reason, "ocr_confidence_below_threshold");
  console.log("✓ confiance trop basse : revalidate");

  const missingProof = await resolveOcrTrust(baseInput(), boundConfig);
  assert.equal(missingProof.useClientOcr, false);
  assert.equal(missingProof.reason, "ocr_proof_missing");
  console.log("✓ mode bound sans challenge/binding : revalidate");

  const { challenge } = await issueOcrChallenge("user-test");
  const goodBinding = computeOcrBinding(challenge, imageSha, forged);
  const replayFirst = await resolveOcrTrust(
    baseInput({
      ocrChallenge: challenge,
      ocrBinding: goodBinding,
      attestEnabled: true,
      attest: {
        ok: true,
        shouldBlock: false,
        reason: "ok",
        mode: "strict",
      },
    }),
    boundConfig,
  );
  assert.equal(replayFirst.useClientOcr, true);
  assert.equal(replayFirst.action, "accept");

  const replaySecond = await resolveOcrTrust(
    baseInput({
      ocrChallenge: challenge,
      ocrBinding: goodBinding,
      attestEnabled: true,
      attest: {
        ok: true,
        shouldBlock: false,
        reason: "ok",
        mode: "strict",
      },
    }),
    boundConfig,
  );
  assert.equal(replaySecond.useClientOcr, false);
  assert.equal(replaySecond.action, "reject");
  assert.equal(replaySecond.reason, "ocr_challenge_replay_or_expired");
  console.log("✓ challenge one-shot : replay rejeté");

  const { challenge: chal2 } = await issueOcrChallenge("user-test");
  const tampered = await resolveOcrTrust(
    baseInput({
      ocrChallenge: chal2,
      ocrBinding: computeOcrBinding(chal2, imageSha, '{"price_eur":1}'),
      attestEnabled: true,
      attest: {
        ok: true,
        shouldBlock: false,
        reason: "ok",
        mode: "strict",
      },
    }),
    boundConfig,
  );
  assert.equal(tampered.useClientOcr, false);
  assert.equal(tampered.action, "reject");
  assert.equal(tampered.reason, "ocr_binding_mismatch");
  console.log("✓ binding altéré : reject");

  assert.equal(payoutsConsistent(12.4, 12.4, 0.05), true);
  assert.equal(payoutsConsistent(99.99, 12.4, 0.05), false);
  console.log("✓ payout OCR vs Vision : 99,99 € rejeté, 12,40 € accepté");

  const visionOnly = await resolveOcrTrust(
    baseInput({ sourceField: "vision", ocrPayload: null }),
  );
  assert.equal(visionOnly.useClientOcr, false);
  assert.equal(visionOnly.reason, "not_ocr_request");
  console.log("✓ source vision : pas d'OCR client");

  const preferVision = decideAnalyzeExtraction({
    trust: { useClientOcr: true, reason: "ocr_bound_ok" },
    visionOk: true,
    visionUnavailable: false,
  });
  assert.equal(preferVision.useClientOcr, false);
  assert.equal(preferVision.reason, "vision_preferred");
  console.log("✓ Vision OK : OCR bound ignoré (Vision preferred)");

  const untrustedDown = decideAnalyzeExtraction({
    trust: { useClientOcr: false, reason: "ocr_revalidate_mode" },
    visionOk: false,
    visionUnavailable: true,
  });
  assert.equal(untrustedDown.useClientOcr, false);
  console.log("✓ Vision down + OCR non prouvé : pas de fallback client");

  const boundFallback = decideAnalyzeExtraction({
    trust: { useClientOcr: true, reason: "ocr_bound_ok" },
    visionOk: false,
    visionUnavailable: true,
  });
  assert.equal(boundFallback.useClientOcr, true);
  assert.equal(boundFallback.reason, "ocr_bound_fallback_vision_unavailable");
  console.log("✓ Vision down + preuves bound : fallback OCR");

  const extractionFailed = decideAnalyzeExtraction({
    trust: { useClientOcr: true, reason: "ocr_bound_ok" },
    visionOk: false,
    visionUnavailable: false,
  });
  assert.equal(extractionFailed.useClientOcr, false);
  console.log("✓ Vision illisible : OCR bound non utilisé (évite hallucination)");

  console.log("\n12/12 tests OCR trust + chemin analyze OK");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
