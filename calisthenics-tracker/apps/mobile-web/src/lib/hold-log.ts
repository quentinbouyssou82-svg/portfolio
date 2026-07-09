import type { ExerciseBlock, WorkoutFormatType } from "@cali/types";

export const FRONT_LEVER_FORMS = [
  "Tuck",
  "Advanced tuck",
  "One-leg",
  "Straddle",
  "Full",
] as const;

export type FrontLeverForm = (typeof FRONT_LEVER_FORMS)[number];

const HOLD_FORMATS = new Set<WorkoutFormatType>(["hold", "isometric", "time"]);

export function isHoldLogExercise(exercise?: ExerciseBlock | null): boolean {
  if (!exercise) return false;
  if (HOLD_FORMATS.has(exercise.format)) return true;
  return /\b(hold|hang|plank|l-sit|hollow|lever|isometric)\b/i.test(exercise.name);
}

export function isFrontLeverHold(exercise?: ExerciseBlock | null): boolean {
  if (!exercise) return false;
  return /front\s*lever/i.test(exercise.name);
}

export function formatHoldLogComments(form?: FrontLeverForm, note?: string): string | undefined {
  const parts: string[] = [];
  if (form) parts.push(`Forme: ${form}`);
  if (note?.trim()) parts.push(note.trim());
  return parts.length > 0 ? parts.join(" · ") : undefined;
}
