import type { ExerciseBlock, ParsedWorkout, SetSpec, WorkoutFormatType } from "./workout.js";

/** États de la machine à états du Workout Engine. */
export type EngineStatus =
  | "IDLE"
  | "READY"
  | "EXERCISE"
  | "REST"
  | "PAUSED"
  | "WAITING_USER_INPUT"
  | "FINISHED";

export type EnginePhase = "work" | "rest" | "idle";

export interface WorkoutPosition {
  exerciseIndex: number;
  setIndex: number;
  round: number;
}

export interface PerformedSetLog {
  id?: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  round: number;
  actualReps?: number;
  actualWeight?: number;
  rir?: number;
  rpe?: number;
  durationSeconds?: number;
  comments?: string;
  completedAt: string;
}

export interface SetLogInput {
  actualReps?: number;
  actualWeight?: number;
  rir?: number;
  rpe?: number;
  durationSeconds?: number;
  comments?: string;
}

/** Snapshot sérialisable — persistance localStorage + API. */
export interface EngineSnapshot {
  version: 1;
  sessionId: string;
  status: EngineStatus;
  workout: ParsedWorkout;
  position: WorkoutPosition;
  phase: EnginePhase;
  statusBeforePause: EngineStatus | null;
  startedAt: string | null;
  pausedAt: string | null;
  accumulatedPauseMs: number;
  logs: PerformedSetLog[];
  pendingLog: SetLogInput | null;
}

/** Vue dérivée pour l'UI — jamais de logique métier côté React. */
export interface EngineView {
  status: EngineStatus;
  phase: EnginePhase;

  currentExercise: ExerciseBlock | null;
  currentSet: SetSpec | null;
  currentRound: number;
  repTarget: number | string | undefined;
  weightTarget: number | undefined;
  instructions: string | undefined;
  definition: string | undefined;

  nextExercise: ExerciseBlock | null;
  nextSet: SetSpec | null;
  currentBlock: ExerciseBlock | null;

  workoutProgress: number;
  exerciseProgress: number;

  elapsedSeconds: number;
  estimatedFinishAt: string | null;
  estimatedRemainingSeconds: number;

  restSeconds: number;
  isResting: boolean;
  isWaitingInput: boolean;
  isPaused: boolean;
  isFinished: boolean;

  /** Index 0-based dans workout.exercises */
  exerciseIndex: number;
  /** Index 0-based de la série courante */
  setIndex: number;

  format: WorkoutFormatType;
}

export type EngineEvent =
  | { type: "LOAD"; sessionId: string; workout: ParsedWorkout }
  | { type: "START" }
  | { type: "FINISH_WORK" }
  | { type: "SUBMIT_LOG"; log: SetLogInput }
  | { type: "SKIP" }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "REST_COMPLETE" }
  | { type: "GO_BACK" }
  | { type: "RESET" };

export interface ControllerContext {
  workout: ParsedWorkout;
  position: WorkoutPosition;
  logs: PerformedSetLog[];
}

export interface ExerciseController {
  readonly formats: readonly WorkoutFormatType[];

  estimateWorkSeconds(
    exercise: ExerciseBlock,
    set: SetSpec,
    ctx?: ControllerContext,
  ): number;
  getRestSeconds(exercise: ExerciseBlock, set: SetSpec, ctx: ControllerContext): number;
  getRepTarget(exercise: ExerciseBlock, set: SetSpec, ctx: ControllerContext): number | string | undefined;
  resolveNextPosition(ctx: ControllerContext): WorkoutPosition | "FINISHED";
  shouldUseRestPhase(exercise: ExerciseBlock, set: SetSpec, ctx: ControllerContext): boolean;
}
