const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "qwen2.5-coder";
const DEFAULT_TIMEOUT_MS = 120_000;

export interface QwenConfig {
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export function getQwenConfig(): QwenConfig {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_BASE_URL,
    model: process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL,
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
  };
}

interface OllamaGenerateResponse {
  response?: string;
  error?: string;
}

export class QwenUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QwenUnavailableError";
  }
}

/** Vérifie que le serveur Ollama répond localement. */
export async function isQwenAvailable(): Promise<boolean> {
  const { baseUrl } = getQwenConfig();
  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5_000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function extractJsonPayload(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

export interface QwenGenerateOptions {
  temperature?: number;
  maxRetries?: number;
}

/**
 * Appelle Qwen via Ollama (100 % local).
 * Endpoint : POST /api/generate
 */
export async function generateQwenJson<T>(
  prompt: string,
  options: QwenGenerateOptions = {},
): Promise<T> {
  const { temperature = 0.35, maxRetries = 1 } = options;
  const { baseUrl, model, timeoutMs } = getQwenConfig();
  const url = `${baseUrl}/api/generate`;

  let lastParseError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: attempt > 0 ? `${prompt}\n\nRéponds UNIQUEMENT avec un JSON valide, sans commentaire.` : prompt,
          stream: false,
          format: "json",
          options: { temperature },
        }),
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
    } catch (e) {
      const hint =
        e instanceof Error && e.name === "TimeoutError"
          ? "La génération a dépassé le délai."
          : "Impossible de joindre Ollama.";
      throw new QwenUnavailableError(
        `${hint} Lancez Ollama avec le modèle « ${model} » sur ${baseUrl}.`,
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new QwenUnavailableError(
        `Ollama a répondu ${response.status}. ${body || `Vérifiez que le modèle est installé (ollama pull ${model}).`}`,
      );
    }

    const data = (await response.json()) as OllamaGenerateResponse;
    if (data.error) {
      throw new QwenUnavailableError(data.error);
    }
    if (!data.response?.trim()) {
      throw new QwenUnavailableError("Réponse vide du modèle Qwen.");
    }

    const jsonText = extractJsonPayload(data.response);
    try {
      return JSON.parse(jsonText) as T;
    } catch {
      lastParseError = new QwenUnavailableError(
        "Le modèle n'a pas renvoyé un JSON valide. Nouvelle tentative…",
      );
      if (attempt < maxRetries) continue;
    }
  }

  throw (
    lastParseError ??
    new QwenUnavailableError("Le modèle n'a pas renvoyé un JSON valide.")
  );
}
