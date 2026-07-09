import { useEffect, useRef, useState, useCallback } from "react";
import type { EngineSnapshot, EngineView, ParsedWorkout, SetLogInput } from "@cali/types";
import { WorkoutEngine, createInitialSnapshot } from "@cali/workout-engine";
import { getControllerForExercise } from "@cali/workout-engine";
import { TimerEngine, type TimerMode } from "@cali/timer-engine";
import { computeLiveStats, type LiveStats } from "@cali/stats-engine";
import { apiFetch } from "@/lib/api";
import { isWarmupExercise } from "@/lib/warmup";

interface UseWorkoutSessionOptions {
  sessionId: string;
  workout: ParsedWorkout;
}

function syncTimer(engine: WorkoutEngine, timer: TimerEngine): void {
  const snap = engine.getSnapshot();
  const timerSnap = timer.getSnapshot();
  const restSeconds = engine.getRestDurationSeconds();

  if (snap.status === "EXERCISE") {
    if (timerSnap.mode !== "work" || timerSnap.status === "completed" || timerSnap.status === "idle") {
      timer.start(engine.getWorkDurationSeconds(), "work");
    } else if (timerSnap.status === "paused") {
      timer.resume();
    }
    return;
  }

  if (snap.status === "WAITING_USER_INPUT" && restSeconds > 0) {
    if (timerSnap.mode === "rest" && timerSnap.status === "running") {
      return;
    }
    timer.start(restSeconds, "rest");
    return;
  }

  if (snap.status === "REST" && restSeconds > 0) {
    if (timerSnap.mode === "rest" && (timerSnap.status === "running" || timerSnap.status === "paused")) {
      return;
    }
    if (timerSnap.mode === "rest" && timerSnap.status === "completed") {
      return;
    }
    timer.start(restSeconds, "rest");
    return;
  }

  if (snap.status === "PAUSED" && timerSnap.status === "running") {
    timer.pause();
  }
}

function willAdvanceToNextExercise(snapshot: EngineSnapshot): boolean {
  const ctx = {
    workout: snapshot.workout,
    position: snapshot.position,
    logs: snapshot.logs,
  };
  const exercise = snapshot.workout.exercises[ctx.position.exerciseIndex];
  if (!exercise) return false;
  const controller = getControllerForExercise(exercise.format, snapshot.workout.format);
  const next = controller.resolveNextPosition(ctx);
  if (next === "FINISHED") return true;
  return next.exerciseIndex !== snapshot.position.exerciseIndex;
}

export function useWorkoutSession({ sessionId, workout }: UseWorkoutSessionOptions) {
  const engineRef = useRef<WorkoutEngine | null>(null);
  const timerRef = useRef<TimerEngine | null>(null);
  const [view, setView] = useState<EngineView | null>(null);
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerMode, setTimerMode] = useState<TimerMode>("idle");
  const activeSecondsRef = useRef(0);
  const restSecondsRef = useRef(0);
  const restFinishedDuringInputRef = useRef(false);

  const submitLogInternal = useCallback(
    async (log: SetLogInput, options?: { skipApi?: boolean }) => {
      const engine = engineRef.current;
      const timer = timerRef.current;
      if (!engine) return;

      const snap = engine.getSnapshot();
      const exercise = snap.workout.exercises[snap.position.exerciseIndex];
      const set = exercise?.sets?.[snap.position.setIndex];
      const warmup = isWarmupExercise(exercise);
      const exerciseIndexBefore = snap.position.exerciseIndex;

      if (engine.getSnapshot().status !== "WAITING_USER_INPUT") return;

      const restDone = restFinishedDuringInputRef.current;
      engine.dispatch({ type: "SUBMIT_LOG", log });

      const afterSnap = engine.getSnapshot();
      const advancesExercise = willAdvanceToNextExercise(afterSnap);

      if (afterSnap.status === "REST") {
        if (advancesExercise || exerciseIndexBefore !== afterSnap.position.exerciseIndex) {
          restFinishedDuringInputRef.current = false;
          const rest = engine.getRestDurationSeconds();
          if (rest > 0 && timer) {
            timer.start(rest, "rest");
          }
        } else if (restDone) {
          restFinishedDuringInputRef.current = false;
          engine.dispatch({ type: "REST_COMPLETE" });
        }
      }

      if (!warmup) {
        activeSecondsRef.current += engine.getWorkDurationSeconds();
      }

      if (!warmup && !options?.skipApi) {
        void apiFetch(`/api/workouts/${sessionId}/sets`, {
          method: "POST",
          body: JSON.stringify({
            exerciseId: exercise?.id,
            exerciseName: exercise?.name,
            setNumber: set?.setNumber ?? snap.position.setIndex + 1,
            round: snap.position.round,
            ...log,
          }),
        }).catch(() => {});
      }
    },
    [sessionId],
  );

  const autoAdvanceWarmup = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine) return;

    const snap = engine.getSnapshot();
    const exercise = snap.workout.exercises[snap.position.exerciseIndex];
    if (!isWarmupExercise(exercise)) return;

    if (snap.status === "EXERCISE") {
      engine.dispatch({ type: "FINISH_WORK" });
    }

    if (engine.getSnapshot().status === "WAITING_USER_INPUT") {
      await submitLogInternal({}, { skipApi: true });
    }
  }, [submitLogInternal]);

  useEffect(() => {
    const existing =
      WorkoutEngine.loadFromStorage(sessionId) ??
      new WorkoutEngine(createInitialSnapshot(sessionId, workout));

    if (existing.getSnapshot().sessionId !== sessionId) {
      existing.dispatch({ type: "LOAD", sessionId, workout });
    }

    const timer = TimerEngine.load(sessionId) ?? new TimerEngine(sessionId);

    timer.onComplete(() => {
      const engine = engineRef.current;
      if (!engine) return;

      const snap = engine.getSnapshot();
      const exercise = snap.workout.exercises[snap.position.exerciseIndex];

      if (snap.status === "EXERCISE" && isWarmupExercise(exercise)) {
        void autoAdvanceWarmup();
        return;
      }

      if (snap.status === "WAITING_USER_INPUT") {
        restFinishedDuringInputRef.current = true;
        return;
      }

      engine.onTimerComplete();
    });

    engineRef.current = existing;
    timerRef.current = timer;

    const updateStats = (v: EngineView, snap: EngineSnapshot) => {
      setStats(
        computeLiveStats({
          snapshot: snap,
          elapsedSeconds: v.elapsedSeconds,
          activeSeconds: activeSecondsRef.current,
          restSeconds: restSecondsRef.current,
        }),
      );
    };

    const unsubEngine = existing.subscribe((v, snap) => {
      setView(v);
      syncTimer(existing, timer);
      void persistEngineState(sessionId, snap);
      updateStats(v, snap);
    });

    const unsubTimer = timer.subscribe((snap) => {
      setTimerRemaining(snap.remainingSeconds);
      setTimerMode(snap.mode);
      engineRef.current?.setTimerRemaining(snap.remainingSeconds);
      if (snap.mode === "rest" && snap.status === "completed") {
        restSecondsRef.current += snap.totalSeconds;
      }
    });

    setTimerRemaining(timer.getSnapshot().remainingSeconds);
    setTimerMode(timer.getSnapshot().mode);

    return () => {
      unsubEngine();
      unsubTimer();
      timer.destroy();
    };
  }, [sessionId, workout, autoAdvanceWarmup]);

  const start = async () => {
    await apiFetch(`/api/workouts/${sessionId}/start`, { method: "POST" });
    engineRef.current?.dispatch({ type: "START" });
  };

  const finishWork = () => {
    const engine = engineRef.current;
    if (!engine) return;

    const snap = engine.getSnapshot();

    if (snap.status === "REST") {
      engine.dispatch({ type: "REST_COMPLETE" });
      return;
    }

    const exercise = snap.workout.exercises[snap.position.exerciseIndex];

    if (isWarmupExercise(exercise)) {
      void autoAdvanceWarmup();
      return;
    }

    engine.dispatch({ type: "FINISH_WORK" });
    restFinishedDuringInputRef.current = false;
  };

  const submitLog = async (log: SetLogInput) => {
    await submitLogInternal(log);
  };

  const goBack = () => {
    const engine = engineRef.current;
    const timer = timerRef.current;
    if (!engine) return;

    const { exerciseIndex, setIndex } = engine.getSnapshot().position;
    if (exerciseIndex <= 0 && setIndex <= 0) return;

    restFinishedDuringInputRef.current = false;
    engine.dispatch({ type: "GO_BACK" });
    if (timer) {
      timer.start(engine.getWorkDurationSeconds(), "work");
    }
  };

  const pause = () => {
    engineRef.current?.dispatch({ type: "PAUSE" });
    timerRef.current?.pause();
  };

  const resume = () => {
    engineRef.current?.dispatch({ type: "RESUME" });
    timerRef.current?.resume();
  };

  const skip = () => {
    engineRef.current?.dispatch({ type: "SKIP" });
  };

  const canGoBack =
    (view?.exerciseIndex ?? 0) > 0 || (view?.setIndex ?? 0) > 0;

  return {
    view,
    stats,
    timerRemaining,
    timerMode,
    canGoBack,
    start,
    finishWork,
    submitLog,
    goBack,
    pause,
    resume,
    skip,
  };
}

async function persistEngineState(
  sessionId: string,
  snapshot: EngineSnapshot,
): Promise<void> {
  try {
    await apiFetch(`/api/workouts/${sessionId}/engine-state`, {
      method: "PATCH",
      body: JSON.stringify({ engineState: snapshot }),
    });
  } catch {
    /* offline */
  }
}
