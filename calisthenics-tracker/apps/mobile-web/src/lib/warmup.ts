import type { ExerciseBlock } from "@cali/types";

const WARMUP_GROUP = /^warmup$/i;
const WARMUP_NOTE = /\[warmup\]|phase:\s*warmup|échauffement/i;

export function isWarmupExercise(exercise?: ExerciseBlock | null): boolean {
  if (!exercise) return false;
  if (exercise.metadata?.warmup === true || exercise.metadata?.skipLog === true) {
    return true;
  }
  if (exercise.groupId && WARMUP_GROUP.test(exercise.groupId)) return true;
  if (exercise.instructions && WARMUP_NOTE.test(exercise.instructions)) return true;
  return false;
}
