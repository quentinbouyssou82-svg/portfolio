import { parseWorkoutWithAi, ParseWorkoutError, type ParseWorkoutResult as AiParseResult } from "@cali/ai-engine";
import {
  enrichParsedWorkout,
  normalizeWorkoutInputDetailed,
  parseWorkoutMarkdown,
  ParseMarkdownError,
  type ParseMarkdownResult,
} from "@cali/workout-parser";
import { generateOllamaJson, OllamaUnavailableError } from "../services/ollama.js";
import { logger } from "../lib/logger.js";

export type ParseMode = "markdown" | "llm";

export interface UnifiedParseResult {
  workout: AiParseResult["workout"];
  warnings: string[];
  durationMs: number;
  parseMode: ParseMode;
  phaseTimings?: Record<string, number>;
}

export function resolveParseMode(
  bodyMode?: string,
  queryMode?: string,
): ParseMode {
  const explicit = bodyMode ?? queryMode;
  if (explicit === "llm" || explicit === "ai") return "llm";
  if (explicit === "markdown" || explicit === "md") return "markdown";
  const env = process.env.WORKOUT_PARSE_MODE?.trim().toLowerCase();
  return env === "llm" || env === "ai" ? "llm" : "markdown";
}

export async function parseWorkout(
  rawText: string,
  mode: ParseMode,
  onProgress?: (message: string) => void,
): Promise<UnifiedParseResult> {
  if (mode === "markdown") {
    onProgress?.("Normalisation du texte…");
    const normalized = normalizeWorkoutInputDetailed(rawText);

    logger.info("parse.normalize", "Entrée normalisée", {
      rawLength: rawText.length,
      normalizedLength: normalized.text.length,
      blockCount: normalized.blockCount,
      transformations: normalized.transformations,
      warnings: normalized.warnings,
    });
    logger.debug("parse.normalize", "Texte brut reçu", {
      rawText: rawText.slice(0, 4000),
    });
    logger.debug("parse.normalize", "Texte normalisé", {
      normalizedText: normalized.text.slice(0, 4000),
    });

    onProgress?.("Lecture du Markdown…");
    const parsed: ParseMarkdownResult = parseWorkoutMarkdown(normalized.text);
    const result: ParseMarkdownResult = {
      ...parsed,
      workout: enrichParsedWorkout(parsed.workout),
    };
    const allWarnings = [...normalized.warnings, ...result.warnings];

    logger.info("parse.markdown", "✅ Séance parsée", {
      durationMs: result.durationMs,
      phaseTimings: result.phaseTimings,
      exercises: result.workout.exercises.length,
      normalizeTransformations: normalized.transformations.length,
      blockCount: normalized.blockCount,
    });
    onProgress?.("Validation terminée");
    return {
      workout: {
        ...result.workout,
        warnings: allWarnings.length > 0 ? allWarnings : undefined,
      },
      warnings: allWarnings,
      durationMs: result.durationMs,
      parseMode: "markdown",
      phaseTimings: result.phaseTimings,
    };
  }

  onProgress?.("Envoi du prompt à Ollama…");
  const aiResult = await parseWorkoutWithAi(
    rawText,
    {
      generateJson: async (prompt, progressCb) => {
        return generateOllamaJson(prompt, {
          onProgress: (msg) => {
            progressCb?.({ step: "generating", message: msg });
            onProgress?.(msg);
          },
        });
      },
    },
    (e) => onProgress?.(e.message),
  );

  return {
    workout: aiResult.workout,
    warnings: aiResult.warnings,
    durationMs: aiResult.durationMs,
    parseMode: "llm",
    phaseTimings: aiResult.phaseTimings,
  };
}

export { ParseWorkoutError, ParseMarkdownError, OllamaUnavailableError };
