import type { ControllerContext, ExerciseController } from "@cali/types";
import {
  DEFAULT_REST_SECONDS,
  estimateRepsSeconds,
  getExercise,
  getSet,
  linearNextPosition,
} from "./base.js";

function pyramidRepAt(setIndex: number, ascending: boolean): number {
  const peak = 5;
  if (ascending) {
    if (setIndex < peak) return setIndex + 1;
    return peak - (setIndex - peak + 1);
  }
  return peak - setIndex;
}

export const pyramidController: ExerciseController = {
  formats: ["pyramid", "reverse_pyramid"],

  estimateWorkSeconds(exercise, set, ctx) {
    const rep = ctx
      ? this.getRepTarget(exercise, set, ctx)
      : set.targetReps;
    return estimateRepsSeconds(rep);
  },

  getRestSeconds(_exercise, set) {
    return set.restAfterSeconds ?? DEFAULT_REST_SECONDS;
  },

  getRepTarget(exercise, set, ctx) {
    if (set.targetReps !== undefined) return set.targetReps;
    const ascending = exercise.format === "pyramid";
    return pyramidRepAt(ctx.position.setIndex, ascending);
  },

  resolveNextPosition: linearNextPosition,

  shouldUseRestPhase(exercise, set, ctx) {
    return (set.restAfterSeconds ?? DEFAULT_REST_SECONDS) > 0;
  },
};

export const ladderController: ExerciseController = {
  formats: ["ladder"],

  estimateWorkSeconds(exercise, set, ctx) {
    const rep = ctx
      ? this.getRepTarget(exercise, set, ctx)
      : set.targetReps;
    return estimateRepsSeconds(rep);
  },

  getRestSeconds(_exercise, set) {
    return set.restAfterSeconds ?? DEFAULT_REST_SECONDS;
  },

  getRepTarget(exercise, set, ctx) {
    if (set.targetReps !== undefined) return set.targetReps;
    const start = (exercise.metadata?.ladderStart as number) ?? 1;
    const step = (exercise.metadata?.ladderStep as number) ?? 1;
    return start + ctx.position.setIndex * step;
  },

  resolveNextPosition: linearNextPosition,

  shouldUseRestPhase(exercise, set) {
    return (set.restAfterSeconds ?? DEFAULT_REST_SECONDS) > 0;
  },
};
