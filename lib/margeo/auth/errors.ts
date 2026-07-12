/** Erreur Supabase Auth (AuthApiError ou équivalent). */
export type AuthErrorLike = {
  message?: string;
  code?: string;
  status?: number;
};

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou mot de passe incorrect.",
  email_not_confirmed: "Compte non activé. Réessaie dans quelques instants ou contacte l'équipe.",
  user_already_exists: "Un compte existe déjà avec cet email.",
  email_exists: "Un compte existe déjà avec cet email.",
  signup_disabled: "Les inscriptions sont temporairement désactivées.",
  weak_password: "Le mot de passe est trop faible (minimum 6 caractères).",
  over_email_send_rate_limit:
    "Trop de tentatives. Attends quelques minutes avant de réessayer.",
  over_request_rate_limit:
    "Trop de requêtes. Attends 1 à 2 minutes avant de réessayer.",
  too_many_requests:
    "Trop de tentatives. Attends 1 à 2 minutes avant de réessayer.",
  request_timeout: "Le serveur met trop de temps à répondre. Réessaie.",
  session_not_found: "Session expirée. Reconnecte-toi.",
  refresh_token_not_found: "Session expirée. Reconnecte-toi.",
  user_not_found: "Aucun compte avec cet email.",
  validation_failed: "Email ou mot de passe invalide.",
};

/** Mappe code + message Supabase vers un texte utilisateur FR. */
export function resolveAuthError(error: AuthErrorLike | string): string {
  if (typeof error === "string") {
    return mapAuthMessage(error);
  }

  const code = error.code?.toLowerCase();
  if (code && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code];
  }

  if (error.message) {
    return mapAuthMessage(error.message);
  }

  return "Une erreur est survenue. Réessaie.";
}

/** @deprecated Préférer resolveAuthError */
export function mapAuthError(message: string, code?: string): string {
  if (code) {
    const fromCode = CODE_MESSAGES[code.toLowerCase()];
    if (fromCode) return fromCode;
  }
  return mapAuthMessage(message);
}

function mapAuthMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return CODE_MESSAGES.invalid_credentials;
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return CODE_MESSAGES.user_already_exists;
  }
  if (lower.includes("email not confirmed")) {
    return CODE_MESSAGES.email_not_confirmed;
  }
  if (lower.includes("signup is disabled")) {
    return CODE_MESSAGES.signup_disabled;
  }
  if (
    lower.includes("email rate limit") ||
    lower.includes("over_email_send_rate_limit")
  ) {
    return CODE_MESSAGES.over_email_send_rate_limit;
  }
  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("too many attempts")
  ) {
    return CODE_MESSAGES.over_request_rate_limit;
  }
  if (lower.includes("password should be at least") || lower.includes("weak password")) {
    return CODE_MESSAGES.weak_password;
  }
  if (lower.includes("user not found")) {
    return CODE_MESSAGES.user_not_found;
  }

  if (
    lower.includes("supabase") ||
    lower.includes("fetch failed") ||
    lower.includes("network") ||
    lower.includes("json") ||
    lower.includes("unexpected") ||
    lower.includes("internal")
  ) {
    return "Une erreur est survenue. Réessaie dans quelques instants.";
  }

  return message.length > 120
    ? "Une erreur est survenue. Réessaie."
    : message || "Une erreur est survenue. Réessaie.";
}
