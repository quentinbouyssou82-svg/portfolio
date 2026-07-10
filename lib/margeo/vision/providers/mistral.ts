import { VISION_EXTRACTION_PROMPT } from "../extraction-prompt";
import { toBase64 } from "../image-encoding";
import type { VisionProvider, VisionProviderResult } from "./types";

const DEFAULT_MODEL =
  process.env.UBERLY_MISTRAL_VISION_MODEL?.trim() || "pixtral-12b-2409";

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

export const mistralVisionProvider: VisionProvider = {
  id: "mistral",

  async analyzeImage(
    image: File | Blob | ArrayBuffer,
  ): Promise<VisionProviderResult> {
    const apiKey = getApiKey();
    const { base64, mimeType } = await toBase64(image);
    const started = Date.now();

    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.05,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: VISION_EXTRACTION_PROMPT },
              {
                type: "image_url",
                image_url: `data:${mimeType};base64,${base64}`,
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
  },
};
