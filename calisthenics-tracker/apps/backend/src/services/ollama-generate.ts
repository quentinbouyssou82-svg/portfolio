import { logger } from "../lib/logger.js";
import { getOllamaConfig, OllamaUnavailableError } from "./ollama.js";
import {
  estimateTokens,
  incrementGenerateCalls,
  nsToMs,
} from "./ollama-metrics.js";

export interface OllamaGenerateParams {
  prompt: string;
  system?: string;
  stream?: boolean;
  format?: "json" | Record<string, unknown>;
  keep_alive?: string | number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repeat_penalty?: number;
  num_ctx?: number;
  num_predict?: number;
  /** Pour les logs uniquement */
  label?: string;
}

export interface OllamaGenerateTimings {
  wallMs: number;
  loadMs?: number;
  promptEvalMs?: number;
  evalMs?: number;
  totalMs?: number;
  promptEvalCount?: number;
  evalCount?: number;
}

export interface OllamaGenerateResult {
  rawResponse: string;
  timings: OllamaGenerateTimings;
  model: string;
  endpoint: string;
  callNumber: number;
}

interface OllamaApiResponse {
  response?: string;
  done?: boolean;
  error?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
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

/** Appel bas niveau /api/generate avec logs complets et timings Ollama. */
export async function callOllamaGenerate(
  params: OllamaGenerateParams,
): Promise<OllamaGenerateResult> {
  const { baseUrl, model, timeoutMs } = getOllamaConfig();
  const endpoint = `${baseUrl}/api/generate`;
  const callNumber = incrementGenerateCalls();
  const wallStart = Date.now();

  const stream = params.stream ?? false;
  const options = {
    temperature: params.temperature ?? 0.25,
    ...(params.top_p != null ? { top_p: params.top_p } : {}),
    ...(params.top_k != null ? { top_k: params.top_k } : {}),
    ...(params.repeat_penalty != null ? { repeat_penalty: params.repeat_penalty } : {}),
    ...(params.num_ctx != null ? { num_ctx: params.num_ctx } : {}),
    num_predict: params.num_predict ?? 2048,
  };

  const body: Record<string, unknown> = {
    model,
    prompt: params.prompt,
    stream,
    options,
  };

  if (params.system) body.system = params.system;
  if (params.format != null) body.format = params.format;
  if (params.keep_alive != null) body.keep_alive = params.keep_alive;

  const promptChars = params.prompt.length;
  const systemChars = params.system?.length ?? 0;

  logger.info("ollama.request", `📤 Appel #${callNumber} — ${params.label ?? "generate"}`, {
    callNumber,
    label: params.label,
    model,
    endpoint,
    systemPrompt: params.system ?? "(aucun)",
    userPromptPreview: params.prompt.slice(0, 300),
    userPromptFull: params.prompt,
    chars: { system: systemChars, user: promptChars, total: systemChars + promptChars },
    estimatedTokens: {
      system: estimateTokens(params.system ?? ""),
      user: estimateTokens(params.prompt),
      total: estimateTokens((params.system ?? "") + params.prompt),
    },
    params: {
      stream,
      format: params.format ?? null,
      keep_alive: params.keep_alive ?? null,
      temperature: options.temperature,
      top_p: params.top_p ?? null,
      top_k: params.top_k ?? null,
      repeat_penalty: params.repeat_penalty ?? null,
      num_ctx: params.num_ctx ?? null,
      num_predict: options.num_predict,
    },
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new OllamaUnavailableError(
        `Ollama ${response.status}. ${errBody}`,
        "OLLAMA_HTTP_ERROR",
        { status: response.status, body: errBody },
      );
    }

    const data = (await response.json()) as OllamaApiResponse;
    if (data.error) {
      throw new OllamaUnavailableError(data.error, "STREAM_ERROR");
    }

    const rawResponse = data.response?.trim() ?? "";
    const wallMs = Date.now() - wallStart;

    const timings: OllamaGenerateTimings = {
      wallMs,
      loadMs: nsToMs(data.load_duration),
      promptEvalMs: nsToMs(data.prompt_eval_duration),
      evalMs: nsToMs(data.eval_duration),
      totalMs: nsToMs(data.total_duration),
      promptEvalCount: data.prompt_eval_count,
      evalCount: data.eval_count,
    };

    logger.info("ollama.response", `📥 Appel #${callNumber} terminé`, {
      callNumber,
      label: params.label,
      responseChars: rawResponse.length,
      responsePreview: rawResponse.slice(0, 200),
      timings,
      ollamaRaw: {
        load_duration: data.load_duration,
        prompt_eval_duration: data.prompt_eval_duration,
        eval_duration: data.eval_duration,
        total_duration: data.total_duration,
        prompt_eval_count: data.prompt_eval_count,
        eval_count: data.eval_count,
      },
    });

    return { rawResponse, timings, model, endpoint, callNumber };
  } catch (e) {
    const wallMs = Date.now() - wallStart;
    logger.error("ollama.request", `❌ Appel #${callNumber} échoué (${wallMs}ms)`, {
      callNumber,
      label: params.label,
      error: e instanceof Error ? e.message : String(e),
    });

    if (isTimeoutError(e)) {
      throw new OllamaUnavailableError(
        `Timeout après ${Math.round(timeoutMs / 1000)}s (wall: ${wallMs}ms)`,
        "TIMEOUT",
        { timeoutMs, wallMs, model },
      );
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}
