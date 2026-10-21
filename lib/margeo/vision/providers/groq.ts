import { VISION_EXTRACTION_PROMPT } from "../extraction-prompt";
import type { PreparedImage } from "../prepare-image";
import type { VisionProvider, VisionProviderResult } from "./types";

/**
 * Groq Vision (OpenAI-compatible) — failover Mistral.
 * Note: clé `gsk_` = Groq Cloud, pas xAI Grok.
 *
 * Qwen 3.6 raisonne par défaut : sans `reasoning_effort: "none"`,
 * le JSON mode échoue (400 json_validate_failed) sur captures Driveely.
 * OTPM free ~1000 — garder max_completion_tokens < 1000.
 */
const DEFAULT_MODEL =
  process.env.DRIVEELY_GROQ_VISION_MODEL?.trim() || "qwen/qwen3.8-27b";

const REQUEST_TIMEOUT_MS = 12_000;
const MAX_COMPLETION_TOKENS = Math.min(
  800,
  Math.max(
    128,
    Number(process.env.DRIVEELY_GROQ_MAX_COMPLETION_TOKENS ?? 400) || 400,
  ),
);

function getApiKey(): string {
  const key =
    process.env.DRIVEELY_GROQ_API_KEY?.trim() ||
    process.env.GROQ_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "Analyse IA non configurée. Ajoute DRIVEELY_GROQ_API_KEY dans .env.local.",
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
  throw new Error("Réponse Groq Vision vide");
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

function isRateLimitedStatus(status: number, body: string): boolean {
  return (
    status === 429 ||
    /rate[_ ]?limit/i.test(body) ||
    /"type"\s*:\s*"rate_limited"/i.test(body)
  );
}

export const groqVisionProvider: VisionProvider = {
  id: "groq",

  async analyzeImage(
    image: File | Blob | ArrayBuffer | PreparedImage,
  ): Promise<VisionProviderResult> {
    const apiKey = getApiKey();
    const dataUrl = await imageToDataUrl(image);
    const started = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          temperature: 0,
          max_completion_tokens: MAX_COMPLETION_TOKENS,
          // Obligatoire pour qwen3.x + response_format=json_object
          // sur images réelles (sinon 400 json_validate_failed).
          reasoning_effort: "none",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: VISION_EXTRACTION_PROMPT },
                {
                  type: "image_url",
                  image_url: { url: dataUrl },
                },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("Groq Vision : délai dépassé");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const err = await res.text();
      const rateLimited = isRateLimitedStatus(res.status, err);
      throw new Error(
        rateLimited
          ? `Groq Vision : 429 rate_limited ${err.slice(0, 160)}`
          : `Groq Vision : ${res.status} ${err.slice(0, 200)}`,
      );
    }

    const json = await res.json();
    const text = extractJsonText(json.choices?.[0]?.message?.content);

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new Error("Groq Vision : JSON invalide dans la réponse");
    }

    return {
      rawJson: parsed,
      durationMs: Date.now() - started,
      provider: "groq",
    };
  },
};
