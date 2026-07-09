import { Router } from "express";
import { z } from "zod";
import { buildWorkoutParsePrompt } from "@cali/prompts";
import { parseJsonSafe } from "@cali/ai-engine";
import { parsedWorkoutSchema } from "@cali/types";
import { callOllamaGenerate } from "../services/ollama-generate.js";
import { getOllamaMetrics, resetOllamaMetrics, estimateTokens } from "../services/ollama-metrics.js";
import { logger } from "../lib/logger.js";

const bodySchema = z.object({
  rawText: z.string().min(1).max(50_000),
  /** minimal | production */
  mode: z.enum(["minimal", "production"]).default("minimal"),
  /** json | none */
  format: z.enum(["json", "none"]).default("none"),
  num_predict: z.number().int().positive().max(8192).optional(),
});

/** Prompt identique au test terminal `ollama run`. */
export function buildMinimalOllamaPrompt(rawText: string): string {
  return `Convert this workout into valid JSON.

Workout:

${rawText.trim()}

Return ONLY valid JSON.`;
}

export const debugRouter = Router();

/**
 * POST /api/debug/ollama
 * Benchmark brut — aucune logique métier, mesure Ollama seul.
 */
debugRouter.post("/ollama", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_BODY", message: "rawText requis." });
    return;
  }

  const { rawText, mode, format, num_predict } = parsed.data;
  const requestId = `debug-${Date.now()}`;

  resetOllamaMetrics();
  const t0 = Date.now();

  const prompt =
    mode === "minimal" ? buildMinimalOllamaPrompt(rawText) : buildWorkoutParsePrompt(rawText);

  logger.info("debug.ollama", "Benchmark démarré", {
    requestId,
    mode,
    format,
    promptChars: prompt.length,
    estimatedTokens: estimateTokens(prompt),
  });

  try {
    const result = await callOllamaGenerate({
      prompt,
      stream: false,
      format: format === "json" ? "json" : undefined,
      num_predict: num_predict ?? (mode === "minimal" ? 1024 : 2048),
      keep_alive: "30m",
      label: `debug:${mode}:${format}`,
    });

    const totalMs = Date.now() - t0;
    const metrics = getOllamaMetrics();

    res.json({
      requestId,
      mode,
      format,
      prompt: {
        chars: prompt.length,
        estimatedTokens: estimateTokens(prompt),
        preview: prompt.slice(0, 500),
      },
      ollama: {
        callNumber: result.callNumber,
        model: result.model,
        endpoint: result.endpoint,
        responseChars: result.rawResponse.length,
        responsePreview: result.rawResponse.slice(0, 400),
        timings: result.timings,
      },
      metrics: {
        ollamaGenerateCalls: metrics.generateCalls,
        totalWallMs: totalMs,
      },
    });
  } catch (e) {
    res.status(503).json({
      requestId,
      code: e instanceof Error ? e.name : "ERROR",
      message: e instanceof Error ? e.message : String(e),
      metrics: getOllamaMetrics(),
      elapsedMs: Date.now() - t0,
    });
  }
});

/**
 * POST /api/debug/ollama/compare
 * Compare minimal vs production + phases JSON/Zod sur la réponse production.
 */
debugRouter.post("/ollama/compare", async (req, res) => {
  const parsed = bodySchema.pick({ rawText: true }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ code: "INVALID_BODY", message: "rawText requis." });
    return;
  }

  const { rawText } = parsed.data;
  const requestId = `compare-${Date.now()}`;
  resetOllamaMetrics();

  const results: Record<string, unknown> = { requestId };

  // 1. Minimal — sans format json (comme ollama run)
  const tMinimal = Date.now();
  const minimalPrompt = buildMinimalOllamaPrompt(rawText);
  const minimal = await callOllamaGenerate({
    prompt: minimalPrompt,
    stream: false,
    num_predict: 1024,
    keep_alive: "30m",
    label: "compare:minimal:no-format",
  });
  results.minimal = {
    promptChars: minimalPrompt.length,
    estimatedTokens: estimateTokens(minimalPrompt),
    wallMs: Date.now() - tMinimal,
    ollamaTimings: minimal.timings,
    responseChars: minimal.rawResponse.length,
  };

  // 2. Production prompt — sans format
  const tProdNoFmt = Date.now();
  const prodPrompt = buildWorkoutParsePrompt(rawText);
  const prodNoFmt = await callOllamaGenerate({
    prompt: prodPrompt,
    stream: false,
    num_predict: 2048,
    keep_alive: "30m",
    label: "compare:production:no-format",
  });
  results.productionNoFormat = {
    promptChars: prodPrompt.length,
    estimatedTokens: estimateTokens(prodPrompt),
    wallMs: Date.now() - tProdNoFmt,
    ollamaTimings: prodNoFmt.timings,
    responseChars: prodNoFmt.rawResponse.length,
  };

  // 3. Production prompt — avec format:json
  const tProdFmt = Date.now();
  const prodFmt = await callOllamaGenerate({
    prompt: prodPrompt,
    stream: false,
    format: "json",
    num_predict: 2048,
    keep_alive: "30m",
    label: "compare:production:format-json",
  });
  results.productionFormatJson = {
    promptChars: prodPrompt.length,
    estimatedTokens: estimateTokens(prodPrompt),
    wallMs: Date.now() - tProdFmt,
    ollamaTimings: prodFmt.timings,
    responseChars: prodFmt.rawResponse.length,
  };

  // 4. Phases post-Ollama sur réponse production format json
  const tJson = Date.now();
  const jsonResult = parseJsonSafe<unknown>(prodFmt.rawResponse);
  const jsonMs = Date.now() - tJson;

  let zodMs = 0;
  let zodOk = false;
  if (jsonResult.ok) {
    const tZod = Date.now();
    try {
      parsedWorkoutSchema.parse(jsonResult.data);
      zodOk = true;
    } catch {
      zodOk = false;
    }
    zodMs = Date.now() - tZod;
  }

  results.postProcessing = {
    jsonParseMs: jsonMs,
    jsonOk: jsonResult.ok,
    zodMs,
    zodOk,
  };

  results.metrics = getOllamaMetrics();
  results.summary = {
    minimalWallMs: (results.minimal as { wallMs: number }).wallMs,
    productionNoFormatWallMs: (results.productionNoFormat as { wallMs: number }).wallMs,
    productionFormatJsonWallMs: (results.productionFormatJson as { wallMs: number }).wallMs,
    promptSizeRatio: Math.round(
      (prodPrompt.length / minimalPrompt.length) * 100,
    ) / 100,
    ollamaGenerateCalls: getOllamaMetrics().generateCalls,
  };

  logger.info("debug.ollama.compare", "Comparaison terminée", results.summary as object);
  res.json(results);
});
