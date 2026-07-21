import { VISION_EXTRACTION_PROMPT } from "../extraction-prompt";
import type { PreparedImage } from "../prepare-image";
import type { VisionProvider, VisionProviderResult } from "./types";

/** Modèle multimodal rapide (bêta). */
const DEFAULT_MODEL =
  process.env.UBERLY_MISTRAL_VISION_MODEL?.trim() || "mistral-small-latest";

function getApiKey(): string {
  const key = process.env.MISTRAL_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Analyse IA non configurée. Ajoute MISTRAL_API_KEY dans .env.local.",
    );
  }
  return key;
}

function extractJsonText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    const text = content
      .map((chunk) => {
        if (typeof chunk === "string") return chunk;
        if (chunk && typeof chunk === "object" && "text" in chunk) {
          return String((chunk as { text: string }).text);
        }
        return "";
      })
      .join("");
    if (text) return text;
  }
  throw new Error("Réponse Mistral Vision vide");
}

async function imageToDataUrl(
  image: File | Blob | ArrayBuffer | PreparedImage,
): Promise<string> {
  if (
    image &&
    typeof image === "object" &&
    "buffer" in image &&
    "mimeType" in image &&
    Buffer.isBuffer((image as PreparedImage).buffer)
  ) {
    const p = image as PreparedImage;
    return `data:${p.mimeType};base64,${p.buffer.toString("base64")}`;
  }
  if (image instanceof ArrayBuffer) {
    return `data:image/jpeg;base64,${Buffer.from(image).toString("base64")}`;
  }
  const blob = image as Blob;
  const mimeType = blob.type || "image/jpeg";
  const buffer = Buffer.from(await blob.arrayBuffer());
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export const mistralVisionProvider: VisionProvider = {
  id: "mistral",

  async analyzeImage(
    image: File | Blob | ArrayBuffer | PreparedImage,
  ): Promise<VisionProviderResult> {
    const apiKey = getApiKey();
    const dataUrl = await imageToDataUrl(image);
    const started = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          temperature: 0,
          max_tokens: 140,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: VISION_EXTRACTION_PROMPT },
                {
                  type: "image_url",
                  image_url: dataUrl,
                },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Mistral Vision : ${res.status} ${err.slice(0, 200)}`);
      }

      const json = await res.json();
      const text = extractJsonText(json.choices?.[0]?.message?.content);

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(text) as Record<string, unknown>;
      } catch {
        throw new Error("Mistral Vision : JSON invalide dans la réponse");
      }

      return {
        rawJson: parsed,
        durationMs: Date.now() - started,
        provider: "mistral",
      };
    } finally {
      clearTimeout(timeout);
    }
  },
};
