import { resolveVisionProviderId } from "../vision/providers/resolve";
import type { VisionProviderId } from "../vision/providers/types";

/** Vérifie les variables critiques au démarrage d'une route Uberly. */
export interface EnvStatus {
  supabase: boolean;
  serviceRole: boolean;
  /** Clé Gemini configurée (legacy). */
  gemini: boolean;
  /** Clé Mistral configurée. */
  mistral: boolean;
  /** Au moins un provider Vision utilisable. */
  vision: boolean;
  visionProvider: VisionProviderId | null;
  appUrl: boolean;
  readyForBeta: boolean;
  missing: string[];
}

function hasGeminiKey(): boolean {
  return Boolean(
    process.env.UBERLY_GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim(),
  );
}

function hasMistralKey(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY?.trim());
}

function resolveConfiguredVisionProvider(): VisionProviderId | null {
  try {
    return resolveVisionProviderId("auto");
  } catch {
    return null;
  }
}

export function checkUberlyEnv(): EnvStatus {
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
      process.env.UBERLY_VISION_PROVIDER?.trim().toLowerCase() || "mistral";
    if (preferred === "mistral" && !mistral) {
      missing.push("MISTRAL_API_KEY");
    } else if (preferred === "gemini" && !gemini) {
      missing.push("UBERLY_GEMINI_API_KEY");
    } else if (!mistral && !gemini) {
      missing.push("MISTRAL_API_KEY ou UBERLY_GEMINI_API_KEY");
    }
  }

  const appUrl = Boolean(process.env.NEXT_PUBLIC_APP_URL?.trim());
  if (!appUrl) missing.push("NEXT_PUBLIC_APP_URL");

  return {
    supabase,
    serviceRole,
    gemini,
    mistral,
    vision,
    visionProvider,
    appUrl,
    readyForBeta: supabase && serviceRole && vision && (mistral || gemini),
    missing,
  };
}
