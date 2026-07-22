import { VISION_EXTRACTION_PROMPT } from "../extraction-prompt";
import { toBase64 } from "../image-encoding";
import type { VisionProvider, VisionProviderResult } from "./types";

const DEFAULT_MODEL =
  process.env.DRIVEELY_GEMINI_VISION_MODEL?.trim() || "gemini-2.0-flash";

function getApiKey(): string {
  const apiKey =
    process.env.DRIVEELY_GEMINI_API_KEY?.trim() ||
    process.env.UBERLY_GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Analyse IA non configurée. Ajoute DRIVEELY_GEMINI_API_KEY dans .env.local.",
    );
  }
  return apiKey;
}

export const geminiVisionProvider: VisionProvider = {
  id: "gemini",

  async analyzeImage(
    image: File | Blob | ArrayBuffer,
  ): Promise<VisionProviderResult> {
    const apiKey = getApiKey();
    const { base64, mimeType } = await toBase64(image);
    const started = Date.now();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: VISION_EXTRACTION_PROMPT },
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

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Réponse Gemini Vision vide");

    const parsed = JSON.parse(text) as Record<string, unknown>;

    return {
      rawJson: parsed,
      durationMs: Date.now() - started,
      provider: "gemini",
    };
  },
};
