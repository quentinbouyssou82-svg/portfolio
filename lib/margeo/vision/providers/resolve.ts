import type { VisionProvider, VisionProviderId } from "./types";
import { geminiVisionProvider } from "./gemini";
import { mistralVisionProvider } from "./mistral";

export function resolveVisionProviderId(
  override?: VisionProviderId | "auto",
): VisionProviderId {
  if (override && override !== "auto") return override;

  const env = process.env.UBERLY_VISION_PROVIDER?.trim().toLowerCase();

  if (env === "mock") return "mock";
  if (env === "mistral") return "mistral";
  if (env === "gemini") return "gemini";

  if (process.env.MISTRAL_API_KEY?.trim()) return "mistral";
  if (
    process.env.UBERLY_GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim()
  ) {
    return "gemini";
  }

  throw new Error(
    "Analyse IA non configurée. Définis MISTRAL_API_KEY ou UBERLY_GEMINI_API_KEY.",
  );
}

export function getVisionProvider(id: VisionProviderId): VisionProvider | null {
  if (id === "mistral") return mistralVisionProvider;
  if (id === "gemini") return geminiVisionProvider;
  return null;
}
