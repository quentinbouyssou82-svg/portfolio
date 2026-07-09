import type { EngineSnapshot, EngineView } from "@cali/types";
import { getControllerForExercise } from "./controllers/registry.js";
import {
  completedSetsCount,
  getBarSetupSeconds,
  getExercise,
  getSet,
  totalSetsInWorkout,
} from "./controllers/base.js";

export function buildEngineView(
  snapshot: EngineSnapshot,
  timerRemainingSeconds: number,
  elapsedSeconds: number,
  estimatedRemainingSeconds: number,
): EngineView {
  const ctx = {
    workout: snapshot.workout,
    position: snapshot.position,
    logs: snapshot.logs,
  };

  const currentExercise = getExercise(ctx) ?? null;
  const currentSet = getSet(currentExercise ?? undefined, snapshot.position.setIndex) ?? null;
  const controller = currentExercise
    ? getControllerForExercise(currentExercise.format, snapshot.workout.format)
    : null;

  const repTarget = currentExercise && currentSet && controller
    ? controller.getRepTarget(currentExercise, currentSet, ctx)
    : undefined;

  const nextPos = controller?.resolveNextPosition(ctx);
  const nextExercise =
    nextPos && nextPos !== "FINISHED"
      ? snapshot.workout.exercises[nextPos.exerciseIndex] ?? null
      : null;
  const nextSet =
    nextExercise && nextPos && nextPos !== "FINISHED"
      ? getSet(nextExercise, nextPos.setIndex) ?? null
      : null;

  const total = totalSetsInWorkout(ctx);
  const done = completedSetsCount(snapshot.logs);
  const exerciseSets = currentExercise?.sets?.length ?? 1;
  const setsDoneInExercise = snapshot.logs.filter(
    (l) => l.exerciseId === currentExercise?.id,
  ).length;

  const restSeconds =
    snapshot.status === "REST" ? timerRemainingSeconds : 0;

  const startedAt = snapshot.startedAt
    ? new Date(snapshot.startedAt).getTime()
    : null;
  const estimatedFinishAt =
    startedAt !== null
      ? new Date(Date.now() + estimatedRemainingSeconds * 1000).toISOString()
      : null;

  return {
    status: snapshot.status,
    phase: snapshot.phase,
    currentExercise,
    currentSet,
    currentRound: snapshot.position.round + 1,
    repTarget,
    weightTarget: currentSet?.targetWeight,
    instructions: currentExercise?.instructions,
    definition:
      typeof currentExercise?.metadata?.definition === "string"
        ? currentExercise.metadata.definition
        : undefined,
    nextExercise,
    nextSet,
    currentBlock: currentExercise,
    workoutProgress: total > 0 ? done / total : 0,
    exerciseProgress: exerciseSets > 0 ? setsDoneInExercise / exerciseSets : 0,
    elapsedSeconds,
    estimatedFinishAt,
    estimatedRemainingSeconds,
    restSeconds,
    isResting: snapshot.status === "REST",
    isWaitingInput: snapshot.status === "WAITING_USER_INPUT",
    isPaused: snapshot.status === "PAUSED",
    isFinished: snapshot.status === "FINISHED",
    exerciseIndex: snapshot.position.exerciseIndex,
    setIndex: snapshot.position.setIndex,
    format: currentExercise?.format ?? snapshot.workout.format,
  };
}

export function estimateRemainingSeconds(snapshot: EngineSnapshot): number {
  let remaining = 0;
  const logsCount = snapshot.logs.length;
  let virtualLogs = [...snapshot.logs];
  let position = { ...snapshot.position };
  let guard = 0;

  while (guard < 200) {
    guard++;
    const ctx = {
      workout: snapshot.workout,
      position,
      logs: virtualLogs,
    };
    const exercise = getExercise(ctx);
    if (!exercise) break;
    const set = getSet(exercise, position.setIndex);
    if (!set) break;

    const controller = getControllerForExercise(exercise.format, snapshot.workout.format);
    remaining += controller.estimateWorkSeconds(exercise, set);
    remaining += getBarSetupSeconds(position.setIndex);
    if (controller.shouldUseRestPhase(exercise, set, ctx)) {
      remaining += controller.getRestSeconds(exercise, set, ctx);
    }

    virtualLogs = [
      ...virtualLogs,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        setNumber: set.setNumber,
        round: position.round,
        completedAt: new Date().toISOString(),
      },
    ];

    const next = controller.resolveNextPosition(ctx);
    if (next === "FINISHED") break;
    position = next;
  }

  return Math.max(0, remaining);
}
