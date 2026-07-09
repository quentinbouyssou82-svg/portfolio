export type TimerMode = "work" | "rest" | "emom" | "idle";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

export interface TimerSnapshot {
  version: 1;
  sessionId: string;
  mode: TimerMode;
  status: TimerStatus;
  totalSeconds: number;
  remainingSeconds: number;
  startedAt: string | null;
  pausedAt: string | null;
  accumulatedPauseMs: number;
}

export type TimerListener = (snapshot: TimerSnapshot) => void;

const STORAGE_PREFIX = "cali_timer_";

export class TimerEngine {
  private snapshot: TimerSnapshot;
  private listeners = new Set<TimerListener>();
  private tickHandle: ReturnType<typeof setInterval> | null = null;
  private onCompleteCallback: (() => void) | null = null;

  constructor(sessionId: string, snapshot?: TimerSnapshot) {
    this.snapshot = snapshot ?? {
      version: 1,
      sessionId,
      mode: "idle",
      status: "idle",
      totalSeconds: 0,
      remainingSeconds: 0,
      startedAt: null,
      pausedAt: null,
      accumulatedPauseMs: 0,
    };
  }

  static load(sessionId: string): TimerEngine | null {
    if (typeof localStorage === "undefined") return null;
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`);
      if (!raw) return null;
      const snap = JSON.parse(raw) as TimerSnapshot;
      const engine = new TimerEngine(sessionId, snap);
      if (snap.status === "running" && snap.startedAt) {
        engine.reconcileAfterResume();
      }
      return engine;
    } catch {
      return null;
    }
  }

  getSnapshot(): TimerSnapshot {
    return { ...this.snapshot };
  }

  subscribe(listener: TimerListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  onComplete(cb: () => void): void {
    this.onCompleteCallback = cb;
  }

  start(seconds: number, mode: TimerMode = "work"): void {
    this.stopTick();
    this.snapshot = {
      ...this.snapshot,
      mode,
      status: "running",
      totalSeconds: seconds,
      remainingSeconds: seconds,
      startedAt: new Date().toISOString(),
      pausedAt: null,
    };
    this.persist();
    this.startTick();
    this.notify();
  }

  pause(): void {
    if (this.snapshot.status !== "running") return;
    this.stopTick();
    this.snapshot = {
      ...this.snapshot,
      status: "paused",
      pausedAt: new Date().toISOString(),
    };
    this.persist();
    this.notify();
  }

  resume(): void {
    if (this.snapshot.status !== "paused") return;
    const pauseMs = this.snapshot.pausedAt
      ? Date.now() - new Date(this.snapshot.pausedAt).getTime()
      : 0;
    this.snapshot = {
      ...this.snapshot,
      status: "running",
      pausedAt: null,
      accumulatedPauseMs: this.snapshot.accumulatedPauseMs + pauseMs,
      startedAt: new Date().toISOString(),
    };
    this.persist();
    this.startTick();
    this.notify();
  }

  skip(): void {
    this.complete();
  }

  finish(): void {
    this.complete();
  }

  estimateExerciseTime(reps: number, secondsPerRep = 3): number {
    return Math.max(15, reps * secondsPerRep);
  }

  estimateWorkoutRemaining(
    remainingSets: number,
    avgWorkSeconds: number,
    avgRestSeconds: number,
  ): number {
    return remainingSets * (avgWorkSeconds + avgRestSeconds);
  }

  private reconcileAfterResume(): void {
    if (!this.snapshot.startedAt) return;
    const elapsed = Math.floor(
      (Date.now() - new Date(this.snapshot.startedAt).getTime()) / 1000,
    );
    const remaining = Math.max(0, this.snapshot.remainingSeconds - elapsed);
    this.snapshot.remainingSeconds = remaining;
    if (remaining <= 0) {
      this.complete();
    } else {
      this.startTick();
    }
  }

  private startTick(): void {
    this.stopTick();
    this.tickHandle = setInterval(() => {
      if (this.snapshot.status !== "running") return;
      if (this.snapshot.remainingSeconds <= 1) {
        this.snapshot.remainingSeconds = 0;
        this.complete();
        return;
      }
      this.snapshot.remainingSeconds -= 1;
      this.persist();
      this.notify();
    }, 1000);
  }

  private stopTick(): void {
    if (this.tickHandle) {
      clearInterval(this.tickHandle);
      this.tickHandle = null;
    }
  }

  private complete(): void {
    this.stopTick();
    this.snapshot = {
      ...this.snapshot,
      status: "completed",
      remainingSeconds: 0,
    };
    this.persist();
    this.notify();
    this.onCompleteCallback?.();
  }

  private persist(): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(
      `${STORAGE_PREFIX}${this.snapshot.sessionId}`,
      JSON.stringify(this.snapshot),
    );
  }

  private notify(): void {
    const snap = this.getSnapshot();
    for (const l of this.listeners) l(snap);
  }

  destroy(): void {
    this.stopTick();
    this.listeners.clear();
  }
}
