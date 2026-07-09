import type { ControllerContext, ExerciseController } from "@cali/types";
import {
  DEFAULT_REST_SECONDS,
  DEFAULT_WORK_SECONDS,
  estimateRepsSeconds,
  getExercise,
  getSet,
  linearNextPosition,
} from "./base.js";

/** Straight sets — classic, weighted, bodyweight, tempo, fixed_load, etc. */
export const straightSetsController: ExerciseController = {
  formats: [
    "classic",
    "weighted",
    "bodyweight",
    "tempo",
    "fixed_load",
    "progressive_load",
    "degressive",
    "dropset",
    "cluster",
    "custom",
    "interval",
    "amrap",
    "for_time",
  ],

  estimateWorkSeconds(exercise, set) {
    if (set.durationSeconds) return set.durationSeconds;
    if (exercise.estimatedWorkSeconds) return exercise.estimatedWorkSeconds;
    return estimateRepsSeconds(set.targetReps);
  },

  getRestSeconds(_exercise, set) {
    return set.restAfterSeconds ?? DEFAULT_REST_SECONDS;
  },

  getRepTarget(_exercise, set) {
    return set.targetReps;
  },

  resolveNextPosition(ctx) {
    return linearNextPosition(ctx);
  },

  shouldUseRestPhase(exercise, set, ctx) {
    const rest = this.getRestSeconds(exercise, set, ctx);
    return rest > 0;
  },
};

export const holdController: ExerciseController = {
  formats: ["hold", "isometric", "time"],

  estimateWorkSeconds(_exercise, set) {
    return set.durationSeconds ?? set.restAfterSeconds ?? 30;
  },

  getRestSeconds(_exercise, set) {
    return set.restAfterSeconds ?? DEFAULT_REST_SECONDS;
  },

  getRepTarget(_exercise, set) {
    return set.durationSeconds ? `${set.durationSeconds}s` : set.targetReps;
  },

  resolveNextPosition: linearNextPosition,

  shouldUseRestPhase(exercise, set, ctx) {
    return straightSetsController.shouldUseRestPhase(exercise, set, ctx);
  },
};

export const distanceController: ExerciseController = {
  formats: ["distance"],

  estimateWorkSeconds(exercise, set) {
    if (set.durationSeconds) return set.durationSeconds;
    return exercise.estimatedWorkSeconds ?? 120;
  },

  getRestSeconds(_exercise, set) {
    return set.restAfterSeconds ?? DEFAULT_REST_SECONDS;
  },

  getRepTarget(_exercise, set) {
    return set.distanceMeters ? `${set.distanceMeters}m` : set.targetReps;
  },

  resolveNextPosition: linearNextPosition,

  shouldUseRestPhase(exercise, set, ctx) {
    return straightSetsController.shouldUseRestPhase(exercise, set, ctx);
  },
};
