import type { ParsedWorkoutOutput } from "@cali/types";
import { estimateWarmupRestSeconds, lookupExerciseDefinition } from "@cali/utils";

const WARMUP_GROUP = /^warmup$/i;
const WARMUP_NOTE = /\[warmup\]|phase:\s*warmup|échauffement/i;

export function isWarmupExercise(
  exercise: ParsedWorkoutOutput["exercises"][number],
): boolean {
  if (exercise.metadata?.warmup === true || exercise.metadata?.skipLog === true) {
    return true;
  }
  if (exercise.groupId && WARMUP_GROUP.test(exercise.groupId)) return true;
  if (exercise.instructions && WARMUP_NOTE.test(exercise.instructions)) return true;
  return false;
}

function withDefinition(exercise: ParsedWorkoutOutput["exercises"][number]) {
  const definition =
    (typeof exercise.metadata?.definition === "string"
      ? exercise.metadata.definition
      : undefined) ?? lookupExerciseDefinition(exercise.name);

  if (!definition) return exercise;

  return {
    ...exercise,
    metadata: {
      ...exercise.metadata,
      definition,
    },
  };
}

function withWarmupRest(exercise: ParsedWorkoutOutput["exercises"][number]) {
  const rest = estimateWarmupRestSeconds(exercise);
  const sets = (exercise.sets ?? []).map((set) => ({
    ...set,
    restAfterSeconds: rest,
  }));

  return {
    ...exercise,
    sets,
    metadata: {
      ...exercise.metadata,
      warmup: true,
      skipLog: true,
      warmupRestSeconds: rest,
    },
  };
}

/** Définitions, repos échauffement adaptés, marquage warmup. */
export function enrichParsedWorkout(workout: ParsedWorkoutOutput): ParsedWorkoutOutput {
  const exercises = workout.exercises.map((exercise) => {
    let enriched = withDefinition(exercise);
    if (isWarmupExercise(exercise)) {
      enriched = withWarmupRest(enriched);
    }
    return enriched;
  });

  return { ...workout, exercises };
}
