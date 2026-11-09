import { logVisionWaste } from "../../monitoring/sentry";
import { recordMistralCall } from "../../security/mistral-circuit-breaker";
import { estimateMistralVisionCost } from "../estimate-mistral-cost";
import { VISION_EXTRACTION_PROMPT } from "../extraction-prompt";
import type { PreparedImage } from "../prepare-image";
import type { VisionProvider, VisionProviderResult } from "./types";

/** Modèle multimodal rapide (bêta). */
const DEFAULT_MODEL =
  process.env.DRIVEELY_MISTRAL_VISION_MODEL?.trim() ||
  process.env.UBERLY_MISTRAL_VISION_MODEL?.trim() ||
  "mistral-small-latest";

/** 1 retry max — fail fast vers Groq/Gemini (cible wall <2s). */
const MAX_ATTEMPTS = 2;
const REQUEST_TIMEOUT_MS = 5_000;

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

function isRateLimitedStatus(status: number, body: string): boolean {
  return (
    status === 429 ||
    /rate[_ ]?limit/i.test(body) ||
    /"type"\s*:\s*"rate_limited"/i.test(body)
  );
}

function retryAfterMs(res: Response, attempt: number): number {
  const raw = res.headers.get("retry-after");
  if (raw) {
    const asInt = Number(raw);
    if (Number.isFinite(asInt) && asInt >= 0) {
      return Math.min(8_000, Math.max(250, asInt * 1000));
    }
    const asDate = Date.parse(raw);
    if (Number.isFinite(asDate)) {
      return Math.min(8_000, Math.max(250, asDate - Date.now()));
    }
  }
  // 0.6s, 1.2s, 2.4s — stay inside Vercel budget
  return Math.min(8_000, 600 * 2 ** (attempt - 1));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mistralVisionProvider: VisionProvider = {
  id: "mistral",

  async analyzeImage(
    image: File | Blob | ArrayBuffer | PreparedImage,
  ): Promise<VisionProviderResult> {
    const apiKey = getApiKey();
    const preparedBytes = preparedImageByteLength(image);
    const dataUrl = await imageToDataUrl(image);
    const started = Date.now();

    let lastMessage = "Mistral Vision : erreur inconnue";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      recordMistralCall();

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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
          const rateLimited = isRateLimitedStatus(res.status, err);
          lastMessage = rateLimited
            ? `Mistral Vision : 429 rate_limited ${err.slice(0, 160)}`
            : `Mistral Vision : ${res.status} ${err.slice(0, 200)}`;

          // 429 → throw immédiat pour failover Groq (pas de retry qui brûle le budget <2s).
          if (rateLimited) {
            console.warn("[driveely/mistral] rate_limited_failover", {
              attempt,
              status: res.status,
            });
            throw new Error(lastMessage);
          }
          throw new Error(lastMessage);
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
      } catch (e) {
        const message =
          e instanceof Error && e.name === "AbortError"
            ? "Mistral Vision : timeout (5s)"
            : e instanceof Error
              ? e.message
              : "Mistral Vision : erreur inconnue";
        lastMessage = message;

        // Pas de retry 429 ici — le catch ne doit pas reboucler : failover Groq.
        const waste = estimateMistralVisionCost({
          model: DEFAULT_MODEL,
          preparedImageBytes: preparedBytes,
          promptChars: VISION_EXTRACTION_PROMPT.length,
        });
        logVisionWaste({
          provider: "mistral",
          error: message,
          durationMs: Date.now() - started,
          preparedImageBytes: preparedBytes,
          ...waste,
        });

        throw new Error(message);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new Error(lastMessage);
  },
};

function preparedImageByteLength(
  image: File | Blob | ArrayBuffer | PreparedImage,
): number {
  if (
    image &&
    typeof image === "object" &&
    "preparedBytes" in image &&
    typeof (image as PreparedImage).preparedBytes === "number"
  ) {
    return (image as PreparedImage).preparedBytes;
  }
  if (image instanceof ArrayBuffer) return image.byteLength;
  if (image instanceof Blob) return image.size;
  return 0;
}
