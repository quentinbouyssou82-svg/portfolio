import { QwenUnavailableError } from "@/lib/ai/qwen";

export class MealGenerationError extends Error {
  constructor(
    message: string,
    readonly code: "ai_unavailable" | "validation" | "empty" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "MealGenerationError";
  }
}

export function formatMealGenerationError(error: unknown): string {
  if (error instanceof QwenUnavailableError) {
    return error.message;
  }
  if (error instanceof MealGenerationError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "La génération de repas a échoué. Réessayez dans un instant.";
}
