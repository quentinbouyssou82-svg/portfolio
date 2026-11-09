/**
 * Tests payload OCR on-device (parse) + rappel : la confiance serveur est dans ocr-trust.
 * Usage : npx tsx scripts/test-driveely-on-device-ocr.ts
 */

import { analyzeFromOnDeviceOcr } from "../lib/margeo/analyze-screenshot";
import { parseOnDeviceOcrPayload } from "../lib/margeo/vision/parse-on-device-payload";
import {
  resolveOcrTrust,
  sha256Hex,
} from "../lib/margeo/security/ocr-trust";

async function main() {
  const tests: { name: string; ok: boolean }[] = [];

  function assert(name: string, condition: boolean) {
    tests.push({ name, ok: condition });
    console.log(condition ? "✓" : "✗", name);
  }

  const payload = JSON.stringify({
    platform: "Uber Eats",
    price_eur: 9.5,
    distance_km: 4.2,
    duration_min: 18,
    pickup_address: "McDo Part-Dieu",
    dropoff_address: "Lyon 3",
    stops_count: 1,
    confidence: 90,
  });

  const { parsed, clientConfidence } = parseOnDeviceOcrPayload(payload);
  assert("clientConfidence 90", clientConfidence === 90);
  assert("payout parsed", parsed.raw.payout === 9.5);
  assert("platform uber", String(parsed.raw.platform).toLowerCase().includes("uber"));

  const result = await analyzeFromOnDeviceOcr(payload);
  assert("source on_device_ocr", result.source === "on_device_ocr");
  assert("visionDurationMs 0", result.visionDurationMs === 0);
  assert("offer payout", result.offer.payout === 9.5);
  assert("reliability exists", result.reliability.decisionConfidence > 0);

  // Garde-fou P0 : analyzeFromOnDeviceOcr reste un parseur — la route ne l'appelle
  // que si resolveOcrTrust.useClientOcr === true (défaut : false).
  const trust = await resolveOcrTrust(
    {
      sourceField: "on_device_ocr",
      ocrPayload: JSON.stringify({ price_eur: 99.99, confidence: 99, platform: "Uber Eats" }),
      hasImage: true,
      imageSha256: sha256Hex(Buffer.from("img")),
      ocrChallenge: null,
      ocrBinding: null,
      attest: { ok: true, shouldBlock: false, reason: "app_attest_disabled", mode: "log_only" },
      attestEnabled: false,
    },
    {
      mode: "revalidate",
      allowSkip: false,
      requireAttestForSkip: true,
      minConfidence: 85,
      payoutToleranceEur: 0.05,
      appMode: "beta",
    },
  );
  assert("P0 gate: forged OCR not trusted by default", trust.useClientOcr === false);

  const failed = tests.filter((t) => !t.ok).length;
  console.log(`\n${tests.length - failed}/${tests.length} tests OK`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
