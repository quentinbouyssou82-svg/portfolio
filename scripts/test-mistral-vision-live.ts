/**
 * Test live Mistral Vision (optionnel — nécessite MISTRAL_API_KEY).
 * Usage : npx tsx scripts/test-mistral-vision-live.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeScreenshot } from "../lib/margeo/analyze-screenshot";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

process.env.DRIVEELY_VISION_PROVIDER = "mistral";

if (!process.env.MISTRAL_API_KEY?.trim()) {
  console.log("○ MISTRAL_API_KEY absent — test live ignoré");
  process.exit(0);
}

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

console.log("Appel Mistral Vision…");

(async () => {
  try {
    const result = await analyzeScreenshot(png.buffer, { provider: "vision" });
    console.log("✓ Réponse JSON valide");
    console.log("  source:", result.source);
    console.log("  provider:", result.visionProvider);
    console.log("  quality:", result.extractionQuality);
    console.log("  confidence:", result.confidence);
    console.log("  missingFields:", result.missingFields.join(", ") || "(aucun)");
    console.log("  platform:", result.offer.platform);
    console.log("  payout:", result.offer.payout);
    process.exit(0);
  } catch (e) {
    console.error("✗ Échec:", e instanceof Error ? e.message : e);
    process.exit(1);
  }
})();
