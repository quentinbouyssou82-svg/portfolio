import type {
  ControllerContext,
  ExerciseBlock,
  SetSpec,
  WorkoutPosition,
} from "@cali/types";

export const DEFAULT_WORK_SECONDS = 45;
export const DEFAULT_REST_SECONDS = 90;
/** Temps de transition vers la barre / poste (1re série de l'exercice). */
export const BAR_SETUP_SECONDS = 10;

export function getBarSetupSeconds(setIndex: number): number {
  return setIndex === 0 ? BAR_SETUP_SECONDS : 0;
}

export function getExercise(
  ctx: ControllerContext,
): ExerciseBlock | undefined {
  return ctx.workout.exercises[ctx.position.exerciseIndex];
}

export function getSet(
  exercise: ExerciseBlock | undefined,
  setIndex: number,
): SetSpec | undefined {
  return exercise?.sets?.[setIndex];
}

export function totalSetsInWorkout(ctx: ControllerContext): number {
  return ctx.workout.exercises.reduce(
    (sum, ex) => sum + (ex.sets?.length ?? 1),
    0,
  );
}

export function completedSetsCount(logs: ControllerContext["logs"]): number {
  return logs.length;
}

export function linearNextPosition(
  ctx: ControllerContext,
): WorkoutPosition | "FINISHED" {
  const exercise = getExercise(ctx);
  const sets = exercise?.sets ?? [];
  const setCount = sets.length || 1;

  if (ctx.position.setIndex + 1 < setCount) {
    return {
      ...ctx.position,
      setIndex: ctx.position.setIndex + 1,
    };
  }

  if (ctx.position.exerciseIndex + 1 < ctx.workout.exercises.length) {
    return {
      exerciseIndex: ctx.position.exerciseIndex + 1,
      setIndex: 0,
      round: ctx.position.round,
    };
  }

  return "FINISHED";
}

export function estimateRepsSeconds(reps: number | string | undefined): number {
  if (typeof reps === "number") return Math.max(15, reps * 3);
  if (typeof reps === "string" && reps.toLowerCase() === "max") return 60;
  return DEFAULT_WORK_SECONDS;
}

export function parseRepNumber(
  reps: number | string | undefined,
): number | undefined {
  if (typeof reps === "number") return reps;
  if (typeof reps === "string") {
    const n = parseInt(reps, 10);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export function exercisesInGroup(
  workout: ControllerContext["workout"],
  groupId: string,
): ExerciseBlock[] {
  return workout.exercises.filter((e) => e.groupId === groupId);
}

export function groupIndices(
  workout: ControllerContext["workout"],
  groupId: string,
): number[] {
  return workout.exercises
    .map((e, i) => (e.groupId === groupId ? i : -1))
    .filter((i) => i >= 0);
}
