import type { ParsedWorkout } from "@cali/types";
import { clientLogger } from "./logger";

export interface ParseStreamResult {
  sessionId: string;
  workout: ParsedWorkout;
  warnings: string[];
  durationMs?: number;
}

export interface ParseStreamError {
  code: string;
  message: string;
  details?: unknown;
  logs?: string[];
}

const PARSE_TIMEOUT_MS = 195_000;

function getAuthToken(): string | null {
  return localStorage.getItem("cali_auth_token");
}

function normalizeStreamError(payload: Record<string, unknown>): ParseStreamError {
  const nested = payload.body;
  if (nested && typeof nested === "object" && nested !== null) {
    const b = nested as Record<string, unknown>;
    return {
      code: String(b.code ?? "UNKNOWN"),
      message: String(b.message ?? "Erreur inconnue."),
      details: b.details,
      logs: b.logs as string[] | undefined,
    };
  }
  return {
    code: String(payload.code ?? "UNKNOWN"),
    message: String(payload.message ?? "Erreur inconnue."),
    details: payload.details,
    logs: payload.logs as string[] | undefined,
  };
}

/** Mode compatibilité LLM — flux SSE + Ollama. */
export async function parseWorkoutStream(
  rawText: string,
  onProgress: (message: string) => void,
): Promise<ParseStreamResult> {
  clientLogger.info("parse", "✅ Texte envoyé (LLM)", { length: rawText.length });
  onProgress("Lecture…");

  const token = getAuthToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    clientLogger.error("parse", "❌ Timeout client", { ms: PARSE_TIMEOUT_MS });
    controller.abort();
  }, PARSE_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch("/api/workouts/parse/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ rawText, parseMode: "llm" }),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(
        `L'analyse a dépassé ${Math.round(PARSE_TIMEOUT_MS / 1000)}s. Vérifiez qu'Ollama tourne.`,
      );
    }
    throw e;
  }

  if (!res.ok) {
    clearTimeout(timeoutId);
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const errBody = (await res.json()) as Record<string, unknown>;
      const err = normalizeStreamError(errBody);
      clientLogger.error("parse", "❌ Erreur HTTP", err);
      throw Object.assign(new Error(err.message), err);
    }
    throw new Error(`Erreur réseau ${res.status}`);
  }

  if (!res.body) {
    clearTimeout(timeoutId);
    throw new Error("Réponse vide du serveur.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const lines = part.split("\n");
        let event = "message";
        let data = "";

        for (const line of lines) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          if (line.startsWith("data:")) data = line.slice(5).trim();
        }

        if (!data) continue;

        let payload: Record<string, unknown>;
        try {
          payload = JSON.parse(data) as Record<string, unknown>;
        } catch {
          clientLogger.warn("parse", "SSE JSON invalide", { data: data.slice(0, 200) });
          continue;
        }

        if (event === "progress") {
          const msg = String(payload.message ?? "");
          clientLogger.info("parse", "Progression", { message: msg });
          onProgress(msg);
        }

        if (event === "complete") {
          clearTimeout(timeoutId);
          clientLogger.info("parse", "✅ WorkoutSession créée", payload);
          return payload as unknown as ParseStreamResult;
        }

        if (event === "error") {
          clearTimeout(timeoutId);
          const err = normalizeStreamError(payload);
          clientLogger.error("parse", "❌ Erreur serveur", err);
          throw Object.assign(new Error(err.message), err);
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }

  throw new Error("Flux d'analyse interrompu (connexion fermée sans réponse).");
}
