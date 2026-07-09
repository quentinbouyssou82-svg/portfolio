import type { ControllerContext, ExerciseController, WorkoutPosition } from "@cali/types";
import {
  DEFAULT_REST_SECONDS,
  estimateRepsSeconds,
  getExercise,
  getSet,
  groupIndices,
} from "./base.js";

function groupedNextPosition(
  ctx: ControllerContext,
  restBetweenRounds: boolean,
): WorkoutPosition | "FINISHED" {
  const exercise = getExercise(ctx);
  if (!exercise?.groupId) {
    return advanceLinear(ctx);
  }

  const indices = groupIndices(ctx.workout, exercise.groupId);
  const posInGroup = indices.indexOf(ctx.position.exerciseIndex);
  const sets = exercise.sets ?? [];
  const setCount = sets.length || 1;

  if (posInGroup < indices.length - 1) {
    return {
      exerciseIndex: indices[posInGroup + 1]!,
      setIndex: ctx.position.setIndex,
      round: ctx.position.round,
    };
  }

  if (ctx.position.setIndex + 1 < setCount) {
    return {
      exerciseIndex: indices[0]!,
      setIndex: ctx.position.setIndex + 1,
      round: ctx.position.round,
    };
  }

  const lastGroupExercise = indices[indices.length - 1]!;
  if (lastGroupExercise + 1 < ctx.workout.exercises.length) {
    const nextEx = ctx.workout.exercises[lastGroupExercise + 1];
    if (nextEx && nextEx.groupId !== exercise.groupId) {
      return {
        exerciseIndex: lastGroupExercise + 1,
        setIndex: 0,
        round: ctx.position.round,
      };
    }
  }

  if (restBetweenRounds && ctx.position.round + 1 < (exercise.metadata?.rounds as number ?? 3)) {
    return {
      exerciseIndex: indices[0]!,
      setIndex: 0,
      round: ctx.position.round + 1,
    };
  }

  const afterGroup = indices[indices.length - 1]! + 1;
  if (afterGroup < ctx.workout.exercises.length) {
    return { exerciseIndex: afterGroup, setIndex: 0, round: 0 };
  }

  return "FINISHED";
}

function advanceLinear(ctx: ControllerContext): WorkoutPosition | "FINISHED" {
  const exercise = getExercise(ctx);
  const setCount = exercise?.sets?.length ?? 1;

  if (ctx.position.setIndex + 1 < setCount) {
    return { ...ctx.position, setIndex: ctx.position.setIndex + 1 };
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

export const supersetController: ExerciseController = {
  formats: ["superset"],

  estimateWorkSeconds(_exercise, set, ctx) {
    return estimateRepsSeconds(set.targetReps);
  },

  getRestSeconds(_exercise, set) {
    return set.restAfterSeconds ?? DEFAULT_REST_SECONDS;
  },

  getRepTarget(_exercise, set) {
    return set.targetReps;
  },

  resolveNextPosition(ctx) {
    return groupedNextPosition(ctx, false);
  },

  shouldUseRestPhase(exercise, set, ctx) {
    const exercise_ = getExercise(ctx);
    if (!exercise_?.groupId) return true;
    const indices = groupIndices(ctx.workout, exercise_.groupId);
    const isLastInGroup =
      ctx.position.exerciseIndex === indices[indices.length - 1];
    return isLastInGroup && (set.restAfterSeconds ?? DEFAULT_REST_SECONDS) > 0;
  },
};

export const circuitController: ExerciseController = {
  formats: ["circuit"],

  estimateWorkSeconds(_exercise, set) {
    return estimateRepsSeconds(set.targetReps);
  },

  getRestSeconds(_exercise, set) {
    return set.restAfterSeconds ?? 30;
  },

  getRepTarget(_exercise, set) {
    return set.targetReps;
  },

  resolveNextPosition(ctx) {
    return groupedNextPosition(ctx, true);
  },

  shouldUseRestPhase(exercise, set, ctx) {
    return supersetController.shouldUseRestPhase!(exercise, set, ctx);
  },
};
