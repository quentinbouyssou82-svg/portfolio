/**
 * Extraction et réparation de JSON renvoyé par un LLM.
 * Aucun parsing sémantique de séance — uniquement récupération structurelle.
 */

export function extractJsonPayload(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

/** Réparations courantes sur JSON quasi-valide de LLM. */
export function repairJsonText(text: string): string {
  let s = extractJsonPayload(text);
  s = s.replace(/,\s*([}\]])/g, "$1");
  s = s.replace(/'/g, '"');
  s = s.replace(/\bundefined\b/g, "null");
  s = s.replace(/(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
  return s;
}

export function parseJsonSafe<T>(text: string): { ok: true; data: T } | { ok: false; error: string } {
  const attempts = [text, extractJsonPayload(text), repairJsonText(text)];

  for (const attempt of attempts) {
    try {
      return { ok: true, data: JSON.parse(attempt) as T };
    } catch {
      continue;
    }
  }

  return { ok: false, error: "Impossible de parser le JSON renvoyé par le modèle." };
}
