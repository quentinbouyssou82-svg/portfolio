import { buildWorkoutParsePrompt } from "@cali/prompts";
import { parsedWorkoutSchema, type ParsedWorkoutOutput } from "@cali/types";
import { ZodError } from "zod";
import { parseJsonSafe } from "./json-repair.js";

export interface ParseProgressEvent {
  step: "preflight" | "generating" | "parsing" | "validating" | "saving";
  message: string;
}

export interface OllamaJsonClient {
  generateJson(
    prompt: string,
    onProgress?: (event: ParseProgressEvent) => void,
  ): Promise<{ rawResponse: string; durationMs: number }>;
}

export interface ParseWorkoutResult {
  workout: ParsedWorkoutOutput;
  warnings: string[];
  rawResponse: string;
  durationMs: number;
  phaseTimings: {
    promptBuildMs: number;
    ollamaMs: number;
    jsonParseMs: number;
    zodMs: number;
    totalMs: number;
  };
}

export class ParseWorkoutError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
    public logs?: string[],
  ) {
    super(message);
    this.name = "ParseWorkoutError";
  }
}

/**
 * Parse un texte brut via Qwen — aucun regex sémantique.
 */
export async function parseWorkoutWithAi(
  rawText: string,
  client: OllamaJsonClient,
  onProgress?: (event: ParseProgressEvent) => void,
): Promise<ParseWorkoutResult> {
  const totalStart = Date.now();
  const logs: string[] = [];
  const log = (msg: string) => {
    logs.push(`[${new Date().toISOString()}] ${msg}`);
  };

  const progress = (step: ParseProgressEvent["step"], message: string) => {
    log(`✅ ${message}`);
    onProgress?.({ step, message });
  };

  progress("preflight", "Texte reçu");
  const tPrompt = Date.now();
  const prompt = buildWorkoutParsePrompt(rawText);
  const promptBuildMs = Date.now() - tPrompt;
  log(`✅ Prompt construit (${prompt.length} caractères, ${promptBuildMs}ms)`);

  progress("generating", "Envoi du prompt à Ollama…");
  let rawResponse: string;
  let ollamaMs: number;
  let parsed: unknown;

  try {
    const result = await client.generateJson(prompt, (e) => {
      progress(e.step, e.message);
    });
    rawResponse = result.rawResponse;
    ollamaMs = result.durationMs;
  } catch (e) {
    log(`❌ Échec génération Ollama: ${e instanceof Error ? e.message : String(e)}`);
    throw e;
  }

  log(`✅ Réponse Ollama (${ollamaMs}ms, ${rawResponse.length} car.)`);
  log(`Réponse brute (aperçu): ${rawResponse.slice(0, 400)}`);

  progress("parsing", "Extraction JSON…");
  const tJson = Date.now();
  const jsonResult = parseJsonSafe<unknown>(rawResponse);
  const jsonParseMs = Date.now() - tJson;
  if (!jsonResult.ok) {
    log(`❌ Échec parsing JSON: ${jsonResult.error}`);
    throw new ParseWorkoutError(
      "Le modèle n'a pas renvoyé un JSON valide. Réessayez ou simplifiez le texte.",
      "JSON_PARSE_FAILED",
      jsonResult.error,
      logs,
    );
  }
  parsed = jsonResult.data;
  log(`✅ JSON extrait (${jsonParseMs}ms)`);

  progress("validating", "Validation du schéma…");
  const tZod = Date.now();
  try {
    const workout = parsedWorkoutSchema.parse(parsed);
    const zodMs = Date.now() - tZod;
    log(`✅ Validation Zod OK (${workout.exercises.length} exercice(s), ${zodMs}ms)`);
    const totalMs = Date.now() - totalStart;
    return {
      workout,
      warnings: workout.warnings ?? [],
      rawResponse,
      durationMs: ollamaMs,
      phaseTimings: { promptBuildMs, ollamaMs, jsonParseMs, zodMs, totalMs },
    };
  } catch (e) {
    if (e instanceof ZodError) {
      log(`❌ Échec validation Zod: ${JSON.stringify(e.flatten())}`);
      throw new ParseWorkoutError(
        "Le JSON analysé ne correspond pas au schéma attendu.",
        "VALIDATION_FAILED",
        e.flatten(),
        logs,
      );
    }
    throw e;
  }
}
