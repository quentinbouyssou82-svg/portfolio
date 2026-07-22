import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeScreenshot } from "../lib/margeo/analyze-screenshot";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = value;
}

process.env.DRIVEELY_VISION_PROVIDER = "mistral";

const fixture = path.join(__dirname, "fixtures/driveely-test-screenshot.png");
const buf = fs.readFileSync(fixture);

(async () => {
  const result = await analyzeScreenshot(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  );

  console.log(
    JSON.stringify(
      {
        source: result.source,
        provider: result.visionProvider,
        quality: result.extractionQuality,
        confidence: result.confidence,
        platform: result.offer.platform,
        payout: result.offer.payout,
        distanceKm: result.offer.distanceKm,
        durationMin: result.offer.durationMin,
        pickup: result.offer.pickup,
        dropoff: result.offer.dropoff,
        missingFields: result.missingFields,
      },
      null,
      2,
    ),
  );
})();
