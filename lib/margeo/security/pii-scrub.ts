/**
 * Scrubbing PII avant logs / Sentry.
 * Ne jamais envoyer adresses complètes, GPS précis, images, tokens.
 */

const SENSITIVE_KEY =
  /^(password|token|authorization|cookie|secret|api[_-]?key|refresh[_-]?token|access[_-]?token|signedtransaction|attestation|assertion|image|screenshot|address|pickup|dropoff|lat|lng|latitude|longitude|gps|email|phone|name|first[_-]?name|last[_-]?name)$/i;

export function hashIdentifier(value: string): string {
  // Hash court non cryptographique pour corrélation debug (pas de PII brute)
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return `id_${(h >>> 0).toString(16)}`;
}

export function scrubValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY.test(key)) {
    if (typeof value === "string" && value.length > 0) {
      if (/userId|user_id/i.test(key)) return hashIdentifier(value);
      return "[redacted]";
    }
    if (typeof value === "number" && /lat|lng|latitude|longitude/i.test(key)) {
      return Math.round(value * 10) / 10; // ~11 km precision
    }
    return "[redacted]";
  }

  if (key === "userId" || key === "user_id") {
    return typeof value === "string" ? hashIdentifier(value) : "[redacted]";
  }

  if (Array.isArray(value)) {
    return value.map((v, i) => scrubValue(String(i), v));
  }

  if (value && typeof value === "object") {
    return scrubObject(value as Record<string, unknown>);
  }

  if (typeof value === "string" && value.length > 500) {
    return `${value.slice(0, 80)}…[truncated ${value.length}]`;
  }

  return value;
}

export function scrubObject(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = scrubValue(key, value);
  }
  return out;
}
