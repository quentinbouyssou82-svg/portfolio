/** Messages d'erreur utilisateur pour l'analyse (frontend uniquement). */

export interface AnalysisErrorInput {
  message?: string;
  code?: string;
}

export function getAnalysisErrorMessage(
  error: unknown,
): { title: string; description: string } {
  const input = normalizeError(error);
  const message = input.message ?? "Analyse impossible";
  const { code } = input;
  const lower = message.toLowerCase();

  if (code === "EXTRACTION_FAILED" || lower.includes("montant non détecté")) {
    return {
      title: "Information manquante",
      description:
        "Le montant de la course n'a pas été détecté. Reprends une capture où le gain est bien visible.",
    };
  }

  if (
    code === "IMAGE_REQUIRED" ||
    lower.includes("image requise")
  ) {
    return {
      title: "Image manquante",
      description: "Sélectionne une capture d'écran de la proposition de course.",
    };
  }

  if (
    lower.includes("illisible") ||
    lower.includes("difficile à lire") ||
    lower.includes("impossible de lire") ||
    lower.includes("extraction")
  ) {
    return {
      title: "Capture difficile à lire",
      description:
        "Cette capture est difficile à lire. Essaie une image plus nette avec le gain, la distance et le temps visibles.",
    };
  }

  if (lower.includes("format") || code === "INVALID_IMAGE") {
    return {
      title: "Format non supporté",
      description: "Envoie une capture PNG, JPG ou WebP.",
    };
  }

  if (lower.includes("trop") && (lower.includes("grand") || lower.includes("lourd"))) {
    return {
      title: "Image trop lourde",
      description: "Réduis la taille de l'image ou refais une capture.",
    };
  }

  if (code === "RATE_LIMITED" || lower.includes("trop de requêtes")) {
    return {
      title: "Patiente un instant",
      description: "Tu as fait beaucoup d'analyses. Réessaie dans quelques secondes.",
    };
  }

  if (code === "ONBOARDING_REQUIRED") {
    return {
      title: "Profil incomplet",
      description: "Termine la configuration de ton profil avant d'analyser.",
    };
  }

  if (
    code === "SAVE_FAILED" ||
    lower.includes("non configurée") ||
    lower.includes("serveur") ||
    lower.includes("500")
  ) {
    return {
      title: "Erreur temporaire",
      description:
        "Uberly n'a pas pu analyser cette course. Réessaie dans quelques instants.",
    };
  }

  if (
    lower.includes("mistral") ||
    lower.includes("vision") ||
    lower.includes("api key") ||
    lower.includes("openai")
  ) {
    return {
      title: "Analyse temporairement indisponible",
      description: "Réessaie dans quelques instants avec une capture nette.",
    };
  }

  if (lower.includes("réseau") || lower.includes("network") || lower.includes("fetch")) {
    return {
      title: "Connexion perdue",
      description: "Vérifie ton réseau et réessaie.",
    };
  }

  return {
    title: "Analyse impossible",
    description: "Réessaie avec une autre capture.",
  };
}

function normalizeError(error: unknown): AnalysisErrorInput {
  if (error && typeof error === "object" && "code" in error) {
    const e = error as AnalysisErrorInput;
    return {
      message: e.message ?? "Analyse impossible",
      code: e.code,
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: String(error) };
}
