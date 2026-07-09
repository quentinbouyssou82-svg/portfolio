import type { EngineEvent, EngineSnapshot, EngineView } from "@cali/types";
import { transition, canDispatch, createInitialSnapshot } from "./transitions.js";
import { buildEngineView, estimateRemainingSeconds } from "./view.js";
import { getControllerForExercise } from "./controllers/registry.js";
import { getExercise, getSet, getBarSetupSeconds, DEFAULT_WORK_SECONDS } from "./controllers/base.js";

export type EngineListener = (view: EngineView, snapshot: EngineSnapshot) => void;

const STORAGE_PREFIX = "cali_engine_";

export class WorkoutEngine {
  private snapshot: EngineSnapshot;
  private listeners = new Set<EngineListener>();
  private elapsedSeconds = 0;
  private timerRemainingSeconds = 0;
  private elapsedInterval: ReturnType<typeof setInterval> | null = null;

  constructor(snapshot?: EngineSnapshot) {
    this.snapshot = snapshot ?? {
      version: 1,
      sessionId: "",
      status: "IDLE",
      workout: { format: "classic", exercises: [] },
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

  static loadFromStorage(sessionId: string): WorkoutEngine | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`);
      if (!raw) return null;
      const snapshot = JSON.parse(raw) as EngineSnapshot;
      return new WorkoutEngine(snapshot);
    } catch {
      return null;
    }
  }

  getSnapshot(): EngineSnapshot {
    return this.snapshot;
  }

  getView(): EngineView {
    const estimated = estimateRemainingSeconds(this.snapshot);
    return buildEngineView(
      this.snapshot,
      this.timerRemainingSeconds,
      this.elapsedSeconds,
      estimated,
    );
  }

  subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener);
    listener(this.getView(), this.snapshot);
    return () => this.listeners.delete(listener);
  }

  dispatch(event: EngineEvent): void {
    if (!canDispatch(this.snapshot.status, event.type)) {
      return;
    }

    const prevStatus = this.snapshot.status;
    this.snapshot = transition(this.snapshot, event);

    if (event.type === "START" || (prevStatus === "READY" && this.snapshot.status === "EXERCISE")) {
      this.startElapsedTicker();
      this.startWorkTimer();
    }

    if (this.snapshot.status === "REST" && prevStatus !== "REST") {
      this.startRestTimer();
    }

    if (this.snapshot.status === "EXERCISE" && prevStatus === "REST") {
      this.startWorkTimer();
    }

    if (this.snapshot.status === "PAUSED") {
      this.stopElapsedTicker();
    }

    if (this.snapshot.status === "FINISHED") {
      this.stopElapsedTicker();
    }

    if (event.type === "RESUME") {
      this.startElapsedTicker();
    }

    this.persist();
    this.notify();
  }

  setTimerRemaining(seconds: number): void {
    this.timerRemainingSeconds = seconds;
    this.notify();
  }

  onTimerComplete(): void {
    if (this.snapshot.status === "REST") {
      this.dispatch({ type: "REST_COMPLETE" });
    } else if (this.snapshot.status === "EXERCISE") {
      this.dispatch({ type: "FINISH_WORK" });
    }
  }

  getBaseWorkDurationSeconds(): number {
    const ctx = {
      workout: this.snapshot.workout,
      position: this.snapshot.position,
      logs: this.snapshot.logs,
    };
    const exercise = getExercise(ctx);
    const set = getSet(exercise, this.snapshot.position.setIndex);
    if (!exercise || !set) return DEFAULT_WORK_SECONDS;
    const controller = getControllerForExercise(exercise.format, this.snapshot.workout.format);
    return controller.estimateWorkSeconds(exercise, set);
  }

  getBarSetupSecondsForPosition(): number {
    return getBarSetupSeconds(this.snapshot.position.setIndex);
  }

  getWorkDurationSeconds(): number {
    return this.getBaseWorkDurationSeconds() + this.getBarSetupSecondsForPosition();
  }

  getRestDurationSeconds(): number {
    const ctx = {
      workout: this.snapshot.workout,
      position: this.snapshot.position,
      logs: this.snapshot.logs,
    };
    const exercise = getExercise(ctx);
    const set = getSet(exercise, this.snapshot.position.setIndex);
    if (!exercise || !set) return 0;
    const controller = getControllerForExercise(exercise.format, this.snapshot.workout.format);
    return controller.getRestSeconds(exercise, set, ctx);
  }

  private startWorkTimer(): void {
    this.timerRemainingSeconds = this.getWorkDurationSeconds();
  }

  private startRestTimer(): void {
    this.timerRemainingSeconds = this.getRestDurationSeconds();
  }

  private startElapsedTicker(): void {
    if (this.elapsedInterval) return;
    this.elapsedInterval = setInterval(() => {
      if (this.snapshot.status === "PAUSED") return;
      this.elapsedSeconds += 1;
      this.notify();
    }, 1000);
  }

  private stopElapsedTicker(): void {
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
      this.elapsedInterval = null;
    }
  }

  private persist(): void {
    if (!this.snapshot.sessionId || typeof localStorage === "undefined") return;
    localStorage.setItem(
      `${STORAGE_PREFIX}${this.snapshot.sessionId}`,
      JSON.stringify(this.snapshot),
    );
  }

  private notify(): void {
    const view = this.getView();
    for (const listener of this.listeners) {
      listener(view, this.snapshot);
    }
  }
}

export { createInitialSnapshot, transition, canDispatch };
