import { apiFetch } from "./api";
import { clientLogger } from "./logger";
import { parseWorkoutStream, type ParseStreamResult } from "./parse-workout-stream";

export type ParseMode = "markdown" | "llm";

export interface ParseResult extends ParseStreamResult {
  parseMode?: ParseMode;
}

export const OFFICIAL_WORKOUT_TEMPLATE = `# Workout

Name: Pull Strength

Goal: Force

EstimatedDuration: 70

---

## Block

Type: StraightSets

Exercise: Pull-Up

Sets: 5

Reps: 5

Rest: 180

RIR: 2

---

## Block

Type: EMOM

Duration: 10

Exercise: Push-Up

RepsPerMinute: 10`;

/** Parse une séance — Markdown par défaut (<100ms), LLM si parseMode=llm. */
export async function parseWorkout(
  rawText: string,
  onProgress: (message: string) => void,
  parseMode: ParseMode = "markdown",
): Promise<ParseResult> {
  clientLogger.info("parse", "Début", { mode: parseMode, length: rawText.length });

  if (parseMode === "llm") {
    const result = await parseWorkoutStream(rawText, onProgress);
    return { ...result, parseMode: "llm" };
  }

  onProgress("Lecture du Markdown…");
  const result = await apiFetch<ParseResult>("/api/workouts/parse", {
    method: "POST",
    body: JSON.stringify({ rawText, parseMode: "markdown" }),
  });
  onProgress("Validation terminée");
  clientLogger.info("parse", "✅ Markdown", {
    durationMs: result.durationMs,
    sessionId: result.sessionId,
  });
  return { ...result, parseMode: "markdown" };
}
