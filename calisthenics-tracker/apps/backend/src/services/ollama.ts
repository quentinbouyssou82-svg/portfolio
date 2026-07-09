import { callOllamaGenerate } from "./ollama-generate.js";
import { incrementTagsCalls } from "./ollama-metrics.js";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";
/** mistral répond en ~2 min ; qwen2.5-coder peut bloquer indéfiniment sur format:json */
const DEFAULT_MODEL = "mistral:latest";
const DEFAULT_TIMEOUT_MS = 180_000;
const CONNECT_TIMEOUT_MS = 8_000;
const HEALTH_CACHE_MS = 60_000;

let healthCache: { at: number; status: OllamaHealthStatus } | null = null;

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

export interface OllamaHealthStatus {
  reachable: boolean;
  model: string;
  modelAvailable: boolean;
  availableModels: string[];
  message?: string;
}

interface OllamaTagsResponse {
  models?: Array<{ name: string }>;
}

interface OllamaStreamChunk {
  response?: string;
  done?: boolean;
  error?: string;
}

export class OllamaUnavailableError extends Error {
  constructor(
    message: string,
    public code: string = "OLLAMA_UNAVAILABLE",
    public details?: unknown,
  ) {
    super(message);
    this.name = "OllamaUnavailableError";
  }
}

export function getOllamaConfig(): OllamaConfig {
  const timeoutRaw = process.env.OLLAMA_TIMEOUT_MS?.trim();
  const timeoutMs = timeoutRaw ? Number(timeoutRaw) : DEFAULT_TIMEOUT_MS;
  return {
    baseUrl: process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_BASE_URL,
    model: process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS,
  };
}

export async function listOllamaModels(baseUrl?: string): Promise<string[]> {
  incrementTagsCalls();
  const url = `${baseUrl ?? getOllamaConfig().baseUrl}/api/tags`;
  const res = await fetch(url, { signal: AbortSignal.timeout(CONNECT_TIMEOUT_MS) });
  if (!res.ok) return [];
  const data = (await res.json()) as OllamaTagsResponse;
  return (data.models ?? []).map((m) => m.name);
}

export async function checkOllamaHealth(force = false): Promise<OllamaHealthStatus> {
  if (!force && healthCache && Date.now() - healthCache.at < HEALTH_CACHE_MS) {
    return healthCache.status;
  }

  const { baseUrl, model } = getOllamaConfig();

  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(CONNECT_TIMEOUT_MS),
    });
    if (!res.ok) {
      return {
        reachable: false,
        model,
        modelAvailable: false,
        availableModels: [],
        message: `Ollama a répondu ${res.status}. Vérifiez qu'Ollama est lancé.`,
      };
    }

    const availableModels = await listOllamaModels(baseUrl);
    const modelAvailable = availableModels.some(
      (m) => m === model || m.startsWith(`${model}:`) || m.startsWith(model),
    );

    const status: OllamaHealthStatus = {
      reachable: true,
      model,
      modelAvailable,
      availableModels,
      message: modelAvailable
        ? undefined
        : `Modèle « ${model} » introuvable. Disponibles : ${availableModels.join(", ") || "aucun"}`,
    };
    healthCache = { at: Date.now(), status };
    return status;
  } catch {
    return {
      reachable: false,
      model,
      modelAvailable: false,
      availableModels: [],
      message:
        "Ollama n'est pas lancé. Démarrez Ollama (ollama serve) puis réessayez.",
    };
  }
}

export async function ensureOllamaReady(): Promise<void> {
  const health = await checkOllamaHealth();
  if (!health.reachable) {
    throw new OllamaUnavailableError(
      health.message ?? "Ollama n'est pas lancé.",
      "OLLAMA_NOT_RUNNING",
      health,
    );
  }
  if (!health.modelAvailable) {
    throw new OllamaUnavailableError(
      health.message ??
        `Modèle introuvable. Lancez : ollama pull ${health.model}`,
      "MODEL_NOT_FOUND",
      health,
    );
  }
}

export interface GenerateJsonOptions {
  temperature?: number;
  maxRetries?: number;
  onProgress?: (message: string) => void;
}

function isTimeoutError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  return (
    e.name === "TimeoutError" ||
    e.name === "AbortError" ||
    e.message.includes("timeout") ||
    e.message.includes("aborted")
  );
}

/** Génération JSON via Ollama — 1 seul appel /api/generate par invocation. */
export async function generateOllamaJson(
  prompt: string,
  options: GenerateJsonOptions = {},
): Promise<{ rawResponse: string; durationMs: number }> {
  const { maxRetries = 0, onProgress } = options;
  await ensureOllamaReady();

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const attemptPrompt =
      attempt > 0
        ? `${prompt}\n\nIMPORTANT : Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni commentaire.`
        : prompt;

    onProgress?.(
      attempt === 0
        ? "Compréhension des exercices…"
        : "Nouvelle tentative de génération…",
    );

    const heartbeatId = setInterval(() => {
      onProgress?.("Création du programme…");
    }, 5_000);

    try {
      const result = await callOllamaGenerate({
        prompt: attemptPrompt,
        stream: false,
        num_predict: 1024,
        keep_alive: "30m",
        label: attempt === 0 ? "parse:no-format" : `parse:retry-${attempt}`,
      });

      if (!result.rawResponse) {
        throw new OllamaUnavailableError("Réponse vide du modèle.", "EMPTY_RESPONSE");
      }

      onProgress?.("Réponse Ollama reçue");
      return { rawResponse: result.rawResponse, durationMs: result.timings.wallMs };
    } catch (e) {
      if (e instanceof OllamaUnavailableError) {
        lastError = e;
        if (attempt < maxRetries && e.code === "EMPTY_RESPONSE") continue;
        throw e;
      }
      throw e;
    } finally {
      clearInterval(heartbeatId);
    }
  }

  throw lastError ?? new OllamaUnavailableError("Échec de génération.", "GENERATION_FAILED");
}

export async function isOllamaAvailable(): Promise<boolean> {
  const health = await checkOllamaHealth();
  return health.reachable && health.modelAvailable;
}

/** Génération texte libre. */
export async function generateOllamaText(
  prompt: string,
  options: { temperature?: number } = {},
): Promise<string> {
  const { temperature = 0.5 } = options;
  await ensureOllamaReady();
  const { baseUrl, model, timeoutMs } = getOllamaConfig();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new OllamaUnavailableError(`Ollama ${response.status}`, "HTTP_ERROR");
    }

    const data = (await response.json()) as { response?: string };
    if (!data.response?.trim()) {
      throw new OllamaUnavailableError("Réponse vide.", "EMPTY_RESPONSE");
    }
    return data.response.trim();
  } catch (e) {
    if (isTimeoutError(e)) {
      throw new OllamaUnavailableError(
        `Délai dépassé (${Math.round(timeoutMs / 1000)}s).`,
        "TIMEOUT",
      );
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
