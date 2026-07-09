/** Types de format d'entraînement reconnus par le moteur. */
export type WorkoutFormatType =
  | "classic"
  | "emom"
  | "amrap"
  | "for_time"
  | "ladder"
  | "pyramid"
  | "reverse_pyramid"
  | "superset"
  | "circuit"
  | "dropset"
  | "cluster"
  | "fixed_load"
  | "progressive_load"
  | "degressive"
  | "time"
  | "distance"
  | "hold"
  | "isometric"
  | "weighted"
  | "bodyweight"
  | "tempo"
  | "interval"
  | "custom";

export type LoadUnit = "kg" | "lb" | "bodyweight" | "percent_1rm" | "rpe" | "rir";

export interface TempoSpec {
  eccentric?: number;
  pauseBottom?: number;
  concentric?: number;
  pauseTop?: number;
}

export interface RestSpec {
  seconds?: number;
  note?: string;
}

export interface SetSpec {
  setNumber: number;
  targetReps?: number | string;
  targetWeight?: number;
  loadUnit?: LoadUnit;
  rpe?: number;
  rir?: number;
  tempo?: TempoSpec | string;
  restAfterSeconds?: number;
  durationSeconds?: number;
  distanceMeters?: number;
  notes?: string;
}

export interface ExerciseBlock {
  id: string;
  name: string;
  format: WorkoutFormatType;
  instructions?: string;
  sets?: SetSpec[];
  /** EMOM / AMRAP / For Time */
  timeCapSeconds?: number;
  /** Circuit / superset grouping */
  groupId?: string;
  /** Estimated work time per set (seconds) */
  estimatedWorkSeconds?: number;
  metadata?: Record<string, unknown>;
}

export interface ParsedWorkout {
  title?: string;
  description?: string;
  format: WorkoutFormatType;
  estimatedDurationSeconds?: number;
  exercises: ExerciseBlock[];
  rawNotes?: string;
  warnings?: string[];
}

export interface WorkoutSetLog {
  setNumber: number;
  actualReps?: number;
  actualWeight?: number;
  rir?: number;
  rpe?: number;
  durationSeconds?: number;
  comments?: string;
  completedAt: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutSetLog[];
}

export type SessionStatus =
  | "draft"
  | "parsed"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export interface ActiveSessionState {
  sessionId: string;
  status: SessionStatus;
  currentExerciseIndex: number;
  currentSetIndex: number;
  phase: "work" | "rest" | "transition";
  phaseStartedAt: string;
  phaseEndsAt?: string;
  elapsedSeconds: number;
  estimatedRemainingSeconds?: number;
}

export interface SessionReport {
  totalDurationSeconds: number;
  activeTimeSeconds: number;
  restTimeSeconds: number;
  totalReps: number;
  totalVolumeKg: number;
  repsByExercise: Record<string, number>;
  volumeByExercise: Record<string, number>;
  aiAnalysis?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
}

export interface ApiError {
  code: string;
  message: string;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
}

export interface HealthStatus {
  api: "ok" | "error";
  database: "ok" | "error";
  ollama: "ok" | "unavailable";
  model?: string;
}
