import type { ExerciseController, WorkoutFormatType } from "@cali/types";
import { straightSetsController } from "./straight-sets.js";
import { holdController, distanceController } from "./straight-sets.js";
import { emomController } from "./emom.js";
import { pyramidController, ladderController } from "./pyramid-ladder.js";
import { supersetController, circuitController } from "./grouped.js";

const ALL_CONTROLLERS: ExerciseController[] = [
  emomController,
  pyramidController,
  ladderController,
  supersetController,
  circuitController,
  holdController,
  distanceController,
  straightSetsController,
];

const registry = new Map<WorkoutFormatType, ExerciseController>();

for (const controller of ALL_CONTROLLERS) {
  for (const format of controller.formats) {
    if (!registry.has(format)) {
      registry.set(format, controller);
    }
  }
}

export function getController(format: WorkoutFormatType): ExerciseController {
  return registry.get(format) ?? straightSetsController;
}

export function getControllerForExercise(
  exerciseFormat: WorkoutFormatType,
  workoutFormat: WorkoutFormatType,
): ExerciseController {
  return getController(exerciseFormat !== "classic" ? exerciseFormat : workoutFormat);
}

export { ALL_CONTROLLERS };
