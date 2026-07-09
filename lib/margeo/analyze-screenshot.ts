import type { Platform, RideOffer } from "./types";
import {
  validateCompleteOffer,
  validateExtractedOffer,
} from "./vision/validate-offer";
import { parseVisionJson } from "./vision/parse-vision-response";
import type { ExtractionQuality } from "./vision/extraction-types";

export type ScreenshotAnalysisSource = "mock" | "vision";

export interface ScreenshotAnalysisResult {
  offer: RideOffer;
  source: ScreenshotAnalysisSource;
  confidence: number;
  warnings: string[];
  missingFields: string[];
  extractionQuality: ExtractionQuality;
  /** Durée appel Gemini en ms (vision uniquement). */
  geminiDurationMs?: number;
}

export interface AnalyzeScreenshotOptions {
  seed?: number;
  provider?: "mock" | "vision" | "auto";
}

const EXTRACTION_PROMPT = `Tu es un extracteur de données pour Uberly, copilote des livreurs (France).

Analyse cette capture d'écran de proposition de course.

PLATEFORMES :
- Uber Eats : gain en €, distance km, temps min, nom restaurant + adresse client
- Deliveroo : montant, distance, durée estimée, pickup/dropoff
- Stuart : rémunération, trajet, points de collecte/livraison
- Amazon Flex : bloc rémunération, miles/km, fenêtre horaire

RÈGLES STRICTES :
1. Réponds UNIQUEMENT avec un JSON valide.
2. Si une valeur est illisible ou absente → mets null. N'invente JAMAIS.
3. payout = gain BRUT en euros (nombre).
4. distanceKm = distance totale course en km (nombre ou null).
5. durationMin = durée totale estimée en minutes (nombre ou null).
6. emptyReturnKm = retour à vide en km (0 si non affiché, null si impossible à estimer).
7. pickup / dropoff = texte lu sur l'écran (string ou null).

JSON attendu :
{
  "platform": "Uber Eats" | "Deliveroo" | "Stuart" | "Amazon Flex" | "Autre" | null,
  "pickup": string | null,
  "dropoff": string | null,
  "payout": number | null,
  "distanceKm": number | null,
  "durationMin": number | null,
  "emptyReturnKm": number | null
}`;

export async function analyzeScreenshot(
  image: File | Blob | ArrayBuffer,
  options: AnalyzeScreenshotOptions = {},
): Promise<ScreenshotAnalysisResult> {
  const mode =
    options.provider ??
    (process.env.UBERLY_VISION_PROVIDER === "mock" ? "mock" : "auto");

  if (mode === "mock") {
    return analyzeWithMock(image, options.seed);
  }

  try {
    return await analyzeWithGemini(image);
  } catch (e) {
    console.error("[uberly] Vision failed:", e);
    if (process.env.NODE_ENV === "development") {
      return analyzeWithMock(image, options.seed);
    }
    throw e;
  }
}

async function analyzeWithGemini(
  image: File | Blob | ArrayBuffer,
): Promise<ScreenshotAnalysisResult> {
  const apiKey =
    process.env.UBERLY_GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Analyse IA non configurée. Ajoute UBERLY_GEMINI_API_KEY dans .env.local.",
    );
  }

  const { base64, mimeType } = await toBase64(image);
  const geminiStarted = Date.now();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: EXTRACTION_PROMPT },
              { inline_data: { mime_type: mimeType, data: base64 } },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.05,
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini Vision : ${res.status} ${err.slice(0, 200)}`);
  }

  const geminiDurationMs = Date.now() - geminiStarted;

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Réponse Vision vide");

  const parsed = JSON.parse(text) as Record<string, unknown>;
  const vision = parseVisionJson(parsed);
  const validated = validateExtractedOffer(vision);

  return {
    offer: validated.offer,
    source: "vision",
    confidence: validated.confidence,
    warnings: validated.warnings,
    missingFields: validated.missingFields,
    extractionQuality: validated.extractionQuality,
    geminiDurationMs,
  };
}

async function analyzeWithMock(
  image: File | Blob | ArrayBuffer,
  seed?: number,
): Promise<ScreenshotAnalysisResult> {
  await new Promise((r) => setTimeout(r, 80));
  const hashSeed = seed ?? hashImage(image);
  const mocks: Omit<RideOffer, "id">[] = [
    {
      platform: "Uber Eats" as Platform,
      pickup: "Five Guys, Confluence",
      dropoff: "Sainte-Foy-lès-Lyon",
      payout: 10.4,
      distanceKm: 6.1,
      durationMin: 26,
      emptyReturnKm: 2.1,
    },
    {
      platform: "Deliveroo",
      pickup: "Chez Antoinette, Terreaux",
      dropoff: "Caluire-et-Cuire",
      payout: 4.9,
      distanceKm: 5.4,
      durationMin: 27,
      emptyReturnKm: 3.2,
    },
    {
      platform: "Stuart",
      pickup: "Apple Store Part-Dieu",
      dropoff: "Préfecture",
      payout: 13.6,
      distanceKm: 3.1,
      durationMin: 17,
      emptyReturnKm: 0.7,
    },
  ];
  const index = Math.abs(hashSeed) % mocks.length;
  const validated = validateCompleteOffer({
    ...mocks[index],
    id: crypto.randomUUID(),
  });
  return {
    offer: validated.offer,
    source: "mock",
    confidence: Math.min(validated.confidence, 0.85),
    warnings: validated.warnings,
    missingFields: validated.missingFields,
    extractionQuality: validated.extractionQuality,
  };
}

async function toBase64(
  image: File | Blob | ArrayBuffer,
): Promise<{ base64: string; mimeType: string }> {
  if (image instanceof ArrayBuffer) {
    return {
      base64: Buffer.from(image).toString("base64"),
      mimeType: "image/png",
    };
  }
  const mimeType = image.type || "image/png";
  const buffer = await image.arrayBuffer();
  return {
    base64: Buffer.from(buffer).toString("base64"),
    mimeType,
  };
}

function hashImage(image: File | Blob | ArrayBuffer): number {
  if (image instanceof ArrayBuffer) {
    return new Uint8Array(image).reduce((a, b) => a + b, 0);
  }
  return image.size;
}
