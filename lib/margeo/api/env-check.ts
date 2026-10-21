import { appleRootCAsAvailable } from "../billing/app-store-verify";
import { isRedisConfigured } from "../redis/client";
import {
  hasGeminiKey,
  hasGroqKey,
  hasMistralKey,
  resolveVisionProviderId,
} from "../vision/providers/resolve";
import type { VisionProviderId } from "../vision/providers/types";

/** Vérifie les variables critiques au démarrage d'une route Driveely. */
export interface EnvStatus {
  supabase: boolean;
  serviceRole: boolean;
  /** Clé Gemini configurée (legacy). */
  gemini: boolean;
  /** Clé Groq configurée (failover Vision). */
  groq: boolean;
  /** Clé Mistral configurée. */
  mistral: boolean;
  /** Au moins un provider Vision utilisable. */
  vision: boolean;
  visionProvider: VisionProviderId | null;
  appUrl: boolean;
  readyForBeta: boolean;
  missing: string[];
}

function resolveConfiguredVisionProvider(): VisionProviderId | null {
  try {
    return resolveVisionProviderId("auto");
  } catch {
    return null;
  }
}

export function checkDriveelyEnv(): EnvStatus {
  const missing: string[] = [];

  const hasClientKey = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      process.env.SUPABASE_ANON_KEY?.trim(),
  );
  const supabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && hasClientKey,
  );
  if (!supabase) {
    missing.push(
      "NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  const serviceRole = Boolean(
    process.env.SUPABASE_SECRET_KEY?.trim() ||
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
  if (!serviceRole) {
    missing.push("SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY");
  }

  const gemini = hasGeminiKey();
  const groq = hasGroqKey();
  const mistral = hasMistralKey();
  let visionProvider: VisionProviderId | null = null;
  try {
    visionProvider = resolveConfiguredVisionProvider();
  } catch {
    visionProvider = null;
  }
  const vision = visionProvider != null && visionProvider !== "mock";

  if (!vision) {
    const preferred =
      process.env.DRIVEELY_VISION_PROVIDER?.trim().toLowerCase() ||
      process.env.UBERLY_VISION_PROVIDER?.trim().toLowerCase() ||
      "mistral";
    if (preferred === "mistral" && !mistral) {
      missing.push("MISTRAL_API_KEY");
    } else if (preferred === "groq" && !groq) {
      missing.push("DRIVEELY_GROQ_API_KEY");
    } else if (preferred === "gemini" && !gemini) {
      missing.push("DRIVEELY_GEMINI_API_KEY (ou UBERLY_GEMINI_API_KEY)");
    } else if (!mistral && !groq && !gemini) {
      missing.push(
        "MISTRAL_API_KEY, DRIVEELY_GROQ_API_KEY ou DRIVEELY_GEMINI_API_KEY",
      );
    }
  }

  const appUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());
  if (!appUrl) missing.push("NEXT_PUBLIC_APP_URL");
  // Sans cet identifiant, la vérification StoreKit serveur est indisponible en production :
  // les achats ne peuvent plus activer Premium. On le signale explicitement.
  if (process.env.VERCEL_ENV === "production") {
    if (!process.env.APPLE_APP_STORE_APP_ID?.trim()) {
      missing.push("APPLE_APP_STORE_APP_ID (vérification StoreKit en production)");
    }
    if (!appleRootCAsAvailable()) {
      missing.push("Certificats racine Apple (lib/margeo/billing/certs)");
    }
    if (!isRedisConfigured()) {
      missing.push("UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN");
    }
  }

  return {
    supabase,
    serviceRole,
    gemini,
    groq,
    mistral,
    vision,
    visionProvider,
    appUrl,
    readyForBeta:
      supabase && serviceRole && vision && (mistral || groq || gemini),
    missing,
  };
}
