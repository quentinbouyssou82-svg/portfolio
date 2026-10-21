import type { VisionProvider, VisionProviderId } from "./types";
import { geminiVisionProvider } from "./gemini";
import { groqVisionProvider } from "./groq";
import { mistralVisionProvider } from "./mistral";

/**
 * Ordre préféré : Groq (rapide, reasoning_effort none) → Mistral → Gemini.
 * Mistral reste en failover si Groq 429 / indispo.
 */
export const VISION_FAILOVER_ORDER: Exclude<VisionProviderId, "mock">[] = [
  "groq",
  "mistral",
  "gemini",
];

/**
 * Le fournisseur `mock` produit des analyses factices.
 * Interdit en production (Vercel production ou NODE_ENV=production) : même si
 * DRIVEELY_VISION_PROVIDER=mock est posé par erreur, les vrais providers sont utilisés.
 */
export function isMockVisionAllowed(): boolean {
  if (process.env.VERCEL_ENV === "production") return false;
  if (process.env.NODE_ENV === "production") return false;
  return true;
}

export function hasGroqKey(): boolean {
  return Boolean(
    process.env.DRIVEELY_GROQ_API_KEY?.trim() ||
      process.env.GROQ_API_KEY?.trim(),
  );
}

export function hasGeminiKey(): boolean {
  return Boolean(
    process.env.DRIVEELY_GEMINI_API_KEY?.trim() ||
      process.env.UBERLY_GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim(),
  );
}

export function hasMistralKey(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY?.trim());
}

export function isVisionProviderConfigured(
  id: VisionProviderId,
): boolean {
  if (id === "mistral") return hasMistralKey();
  if (id === "groq") return hasGroqKey();
  if (id === "gemini") return hasGeminiKey();
  if (id === "mock") return true;
  return false;
}

export function resolveVisionProviderId(
  override?: VisionProviderId | "auto",
): VisionProviderId {
  if (override === "mock" && !isMockVisionAllowed()) {
    throw new Error("Fournisseur mock interdit dans cet environnement.");
  }
  if (override && override !== "auto") return override;

  const rawEnv =
    process.env.DRIVEELY_VISION_PROVIDER?.trim().toLowerCase() ||
    process.env.UBERLY_VISION_PROVIDER?.trim().toLowerCase();
  if (rawEnv === "mock" && !isMockVisionAllowed()) {
    console.error(
      "[driveely/vision] DRIVEELY_VISION_PROVIDER=mock ignoré en production : fournisseurs réels utilisés.",
    );
  }
  const env = rawEnv === "mock" && !isMockVisionAllowed() ? undefined : rawEnv;

  if (env === "mock") return "mock";
  if (env === "mistral") {
    if (!hasMistralKey()) {
      throw new Error(
        "Analyse IA non configurée. Ajoute MISTRAL_API_KEY sur le serveur.",
      );
    }
    return "mistral";
  }
  if (env === "groq") {
    if (!hasGroqKey()) {
      throw new Error(
        "Analyse IA non configurée. Ajoute DRIVEELY_GROQ_API_KEY sur le serveur.",
      );
    }
    return "groq";
  }
  if (env === "gemini") {
    if (!hasGeminiKey()) {
      throw new Error(
        "Analyse IA non configurée. Ajoute DRIVEELY_GEMINI_API_KEY sur le serveur.",
      );
    }
    return "gemini";
  }

  // Auto: prioriser Groq pour la latence (<2s), Mistral ensuite.
  if (hasGroqKey()) return "groq";
  if (hasMistralKey()) return "mistral";
  if (hasGeminiKey()) return "gemini";

  throw new Error(
    "Analyse IA non configurée. Définis MISTRAL_API_KEY, DRIVEELY_GROQ_API_KEY ou DRIVEELY_GEMINI_API_KEY.",
  );
}

export function getVisionProvider(id: VisionProviderId): VisionProvider | null {
  if (id === "mistral") return mistralVisionProvider;
  if (id === "groq") return groqVisionProvider;
  if (id === "gemini") return geminiVisionProvider;
  return null;
}
