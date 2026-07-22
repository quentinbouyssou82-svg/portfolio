/** Messages d'erreur utilisateur pour l'analyse (frontend uniquement). */

export interface AnalysisErrorInput {
  message?: string;
  code?: string;
}

export function getAnalysisErrorMessage(
  error: unknown,
): {
  title: string;
  description: string;
  href?: string;
  cta?: string;
} {
  const input = normalizeError(error);
  const message = input.message ?? "Analyse impossible";
  const { code } = input;
  const lower = message.toLowerCase();

  if (code === "EXTRACTION_FAILED" || lower.includes("montant non détecté")) {
    return {
      title: "Gain non détecté",
      description:
        "Le montant n'est pas visible. Reprends une capture où le gain est bien lisible.",
    };
  }

  if (
    code === "IMAGE_REQUIRED" ||
    lower.includes("image requise")
  ) {
    return {
      title: "Aucune image",
      description: "Sélectionne la capture de la proposition de course.",
    };
  }

  if (
    lower.includes("illisible") ||
    lower.includes("difficile à lire") ||
    lower.includes("impossible de lire") ||
    lower.includes("extraction")
  ) {
    return {
      title: "Capture illisible",
      description:
        "Image trop floue ou recadrée. Montre le gain, la distance et le temps.",
    };
  }

  if (lower.includes("format") || code === "INVALID_IMAGE") {
    return {
      title: "Format non supporté",
      description: "PNG, JPG ou WebP uniquement.",
    };
  }

  if (lower.includes("trop") && (lower.includes("grand") || lower.includes("lourd"))) {
    return {
      title: "Image trop lourde",
      description: "Refais une capture ou réduis la taille.",
    };
  }

  if (code === "RATE_LIMITED" || lower.includes("trop de requêtes")) {
    return {
      title: "Trop d'analyses",
      description: "Réessaie dans quelques secondes.",
    };
  }

  if (
    code === "DAILY_LIMIT_REACHED" ||
    lower.includes("limite découverte") ||
    lower.includes("analyses / jour")
  ) {
    return {
      title: "Limite du jour atteinte",
      description:
        "2 analyses/jour en Découverte. Passe en Pro pour débloquer l'illimité.",
      href: "/demos/driveely/premium?source=quota",
      cta: "Commencer mon essai gratuit →",
    };
  }

  if (code === "PLAN_FORBIDDEN") {
    return {
      title: "Plan insuffisant",
      description: "Ton offre actuelle ne permet pas d'analyser.",
      href: "/demos/driveely/premium?source=quota",
      cta: "Voir mon plan →",
    };
  }

  if (code === "ONBOARDING_REQUIRED") {
    return {
      title: "Profil incomplet",
      description: "Termine la configuration avant d'analyser.",
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
        "Driveely n'a pas pu analyser. Réessaie dans un instant.",
    };
  }

  if (
    lower.includes("mistral") ||
    lower.includes("vision") ||
    lower.includes("api key") ||
    lower.includes("openai")
  ) {
    return {
      title: "Service indisponible",
      description: "Réessaie avec une capture nette.",
    };
  }

  if (lower.includes("réseau") || lower.includes("network") || lower.includes("fetch")) {
    return {
      title: "Pas de connexion",
      description: "Vérifie ton réseau et réessaie.",
    };
  }

  return {
    title: "Analyse impossible",
    description: "Essaie une autre capture.",
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
