import type {
  EngineEvent,
  EngineSnapshot,
  EngineStatus,
  PerformedSetLog,
  SetLogInput,
} from "@cali/types";
import { getControllerForExercise } from "./controllers/registry.js";
import { getExercise, getSet } from "./controllers/base.js";

export function createInitialSnapshot(
  sessionId: string,
  workout: EngineSnapshot["workout"],
): EngineSnapshot {
  return {
    version: 1,
    sessionId,
    status: "READY",
    workout,
    position: { exerciseIndex: 0, setIndex: 0, round: 0 },
    phase: "idle",
    statusBeforePause: null,
    startedAt: null,
    pausedAt: null,
    accumulatedPauseMs: 0,
    logs: [],
    pendingLog: null,
  };
}

export function transition(
  snapshot: EngineSnapshot,
  event: EngineEvent,
  now: Date = new Date(),
): EngineSnapshot {
  switch (event.type) {
    case "LOAD":
      return createInitialSnapshot(event.sessionId, event.workout);

    case "RESET":
      return createInitialSnapshot(snapshot.sessionId, snapshot.workout);

    case "START":
      if (snapshot.status !== "READY" && snapshot.status !== "IDLE") {
        return snapshot;
      }
      return {
        ...snapshot,
        status: "EXERCISE",
        phase: "work",
        startedAt: snapshot.startedAt ?? now.toISOString(),
      };

    case "FINISH_WORK":
      if (snapshot.status !== "EXERCISE") return snapshot;
      return {
        ...snapshot,
        status: "WAITING_USER_INPUT",
        phase: "idle",
      };

    case "SUBMIT_LOG": {
      if (snapshot.status !== "WAITING_USER_INPUT") return snapshot;
      const log = buildPerformedLog(snapshot, event.log, now);
      const withLog: EngineSnapshot = {
        ...snapshot,
        logs: [...snapshot.logs, log],
        pendingLog: null,
      };
      return afterLogSubmitted(withLog, now);
    }

    case "SKIP":
      return skipCurrent(withSnapshotGuard(snapshot), now);

    case "PAUSE":
      if (snapshot.status === "PAUSED" || snapshot.status === "FINISHED") {
        return snapshot;
      }
      return {
        ...snapshot,
        status: "PAUSED",
        statusBeforePause: snapshot.status,
        pausedAt: now.toISOString(),
      };

    case "RESUME":
      if (snapshot.status !== "PAUSED" || !snapshot.statusBeforePause) {
        return snapshot;
      }
      const pauseMs = snapshot.pausedAt
        ? now.getTime() - new Date(snapshot.pausedAt).getTime()
        : 0;
      return {
        ...snapshot,
        status: snapshot.statusBeforePause,
        statusBeforePause: null,
        pausedAt: null,
        accumulatedPauseMs: snapshot.accumulatedPauseMs + pauseMs,
      };

    case "REST_COMPLETE":
      if (snapshot.status !== "REST") return snapshot;
      return advanceAfterRest(snapshot);

    case "GO_BACK":
      return goBack(snapshot);

    default:
      return snapshot;
  }
}

function withSnapshotGuard(snapshot: EngineSnapshot): EngineSnapshot {
  if (snapshot.status === "READY") {
    return {
      ...snapshot,
      status: "EXERCISE",
      phase: "work",
      startedAt: snapshot.startedAt ?? new Date().toISOString(),
    };
  }
  return snapshot;
}

function buildPerformedLog(
  snapshot: EngineSnapshot,
  input: SetLogInput,
  now: Date,
): PerformedSetLog {
  const exercise = getExercise({
    workout: snapshot.workout,
    position: snapshot.position,
    logs: snapshot.logs,
  });
  const set = getSet(exercise, snapshot.position.setIndex);
  return {
    exerciseId: exercise?.id ?? "unknown",
    exerciseName: exercise?.name ?? "Unknown",
    setNumber: set?.setNumber ?? snapshot.position.setIndex + 1,
    round: snapshot.position.round,
    actualReps: input.actualReps,
    actualWeight: input.actualWeight,
    rir: input.rir,
    rpe: input.rpe,
    durationSeconds: input.durationSeconds,
    comments: input.comments,
    completedAt: now.toISOString(),
  };
}

function afterLogSubmitted(snapshot: EngineSnapshot, now: Date): EngineSnapshot {
  const ctx = {
    workout: snapshot.workout,
    position: snapshot.position,
    logs: snapshot.logs,
  };
  const exercise = getExercise(ctx);
  const set = getSet(exercise, snapshot.position.setIndex);
  if (!exercise || !set) {
    return { ...snapshot, status: "FINISHED", phase: "idle" };
  }

  const controller = getControllerForExercise(exercise.format, snapshot.workout.format);
  const useRest = controller.shouldUseRestPhase(exercise, set, ctx);

  if (useRest) {
    return {
      ...snapshot,
      status: "REST",
      phase: "rest",
    };
  }

  return advanceAfterRest(snapshot);
}

function advanceAfterRest(snapshot: EngineSnapshot): EngineSnapshot {
  const ctx = {
    workout: snapshot.workout,
    position: snapshot.position,
    logs: snapshot.logs,
  };
  const exercise = getExercise(ctx);
  const controller = exercise
    ? getControllerForExercise(exercise.format, snapshot.workout.format)
    : null;

  const next = controller?.resolveNextPosition(ctx) ?? "FINISHED";

  if (next === "FINISHED") {
    return {
      ...snapshot,
      status: "FINISHED",
      phase: "idle",
    };
  }

  return {
    ...snapshot,
    status: "EXERCISE",
    phase: "work",
    position: next,
  };
}

function goBack(snapshot: EngineSnapshot): EngineSnapshot {
  const { exerciseIndex, setIndex } = snapshot.position;

  if (setIndex > 0) {
    const exercise = snapshot.workout.exercises[exerciseIndex];
    if (!exercise) return snapshot;

    const prevSetIndex = setIndex - 1;
    const targetSetNumber = exercise.sets?.[prevSetIndex]?.setNumber ?? prevSetIndex + 1;

    const newLogs = snapshot.logs.filter((log) => {
      if (log.exerciseId !== exercise.id) return true;
      return log.setNumber < targetSetNumber;
    });

    return {
      ...snapshot,
      status: "EXERCISE",
      phase: "work",
      position: {
        ...snapshot.position,
        setIndex: prevSetIndex,
      },
      logs: newLogs,
      pendingLog: null,
      statusBeforePause: null,
      pausedAt: null,
    };
  }

  return goToPreviousExercise(snapshot);
}

function goToPreviousExercise(snapshot: EngineSnapshot): EngineSnapshot {
  const { exerciseIndex } = snapshot.position;
  if (exerciseIndex <= 0) return snapshot;

  const prevIndex = exerciseIndex - 1;
  if (!snapshot.workout.exercises[prevIndex]) return snapshot;

  const newLogs = snapshot.logs.filter((log) => {
    const logExIndex = snapshot.workout.exercises.findIndex((ex) => ex.id === log.exerciseId);
    return logExIndex < prevIndex;
  });

  return {
    ...snapshot,
    status: "EXERCISE",
    phase: "work",
    position: {
      exerciseIndex: prevIndex,
      setIndex: 0,
      round: 0,
    },
    logs: newLogs,
    pendingLog: null,
    statusBeforePause: null,
    pausedAt: null,
  };
}

function skipCurrent(snapshot: EngineSnapshot, now: Date): EngineSnapshot {
  if (snapshot.status === "FINISHED") return snapshot;

  if (snapshot.status === "EXERCISE" || snapshot.status === "REST") {
    const emptyLog: SetLogInput = {};
    const withInput: EngineSnapshot = {
      ...snapshot,
      status: "WAITING_USER_INPUT",
      phase: "idle",
    };
    return transition(withInput, { type: "SUBMIT_LOG", log: emptyLog }, now);
  }

  if (snapshot.status === "WAITING_USER_INPUT") {
    return advanceAfterRest({
      ...snapshot,
      logs: snapshot.logs,
    });
  }

  return snapshot;
}

export function canDispatch(
  status: EngineStatus,
  event: EngineEvent["type"],
): boolean {
  const table: Record<EngineStatus, EngineEvent["type"][]> = {
    IDLE: ["LOAD", "RESET"],
    READY: ["START", "LOAD", "RESET", "GO_BACK"],
    EXERCISE: ["FINISH_WORK", "PAUSE", "SKIP", "GO_BACK"],
    REST: ["REST_COMPLETE", "PAUSE", "SKIP", "GO_BACK"],
    PAUSED: ["RESUME", "GO_BACK"],
    WAITING_USER_INPUT: ["SUBMIT_LOG", "SKIP", "PAUSE", "GO_BACK"],
    FINISHED: ["RESET", "LOAD"],
  };
  return table[status]?.includes(event) ?? false;
}
