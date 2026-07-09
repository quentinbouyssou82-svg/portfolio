import type { ControllerContext, ExerciseController } from "@cali/types";
import {
  DEFAULT_REST_SECONDS,
  estimateRepsSeconds,
  getExercise,
  getSet,
  linearNextPosition,
} from "./base.js";

const EMOM_INTERVAL = 60;

export const emomController: ExerciseController = {
  formats: ["emom"],

  estimateWorkSeconds(_exercise, set) {
    return Math.min(
      estimateRepsSeconds(set.targetReps),
      EMOM_INTERVAL - 5,
    );
  },

  getRestSeconds() {
    return 0;
  },

  getRepTarget(_exercise, set) {
    return set.targetReps;
  },

  resolveNextPosition(ctx) {
    const exercise = getExercise(ctx);
    const totalMinutes = exercise?.timeCapSeconds
      ? Math.ceil(exercise.timeCapSeconds / EMOM_INTERVAL)
      : (exercise?.sets?.length ?? 12);

    if (ctx.position.round + 1 < totalMinutes) {
      return {
        exerciseIndex: ctx.position.exerciseIndex,
        setIndex: ctx.position.setIndex,
        round: ctx.position.round + 1,
      };
    }

    if (ctx.position.exerciseIndex + 1 < ctx.workout.exercises.length) {
      return {
        exerciseIndex: ctx.position.exerciseIndex + 1,
        setIndex: 0,
        round: 0,
      };
    }

    return "FINISHED";
  },

  shouldUseRestPhase() {
    return false;
  },
};
