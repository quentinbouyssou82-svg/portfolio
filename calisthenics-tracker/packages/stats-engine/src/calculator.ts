import type { EngineSnapshot, PerformedSetLog } from "@cali/types";

export interface LiveStats {
  totalReps: number;
  totalVolumeKg: number;
  activeTimeSeconds: number;
  restTimeSeconds: number;
  lostTimeSeconds: number;
  exerciseCount: number;
  completedSets: number;
  averageSetDurationSeconds: number;
  workoutProgress: number;
  repsByExercise: Record<string, number>;
  volumeByExercise: Record<string, number>;
}

export interface StatsInput {
  snapshot: EngineSnapshot;
  elapsedSeconds: number;
  activeSeconds: number;
  restSeconds: number;
}

export function computeLiveStats(input: StatsInput): LiveStats {
  const { snapshot, elapsedSeconds, activeSeconds, restSeconds } = input;
  const logs = snapshot.logs;

  const repsByExercise: Record<string, number> = {};
  const volumeByExercise: Record<string, number> = {};
  let totalReps = 0;
  let totalVolumeKg = 0;

  for (const log of logs) {
    const reps = log.actualReps ?? 0;
    const weight = log.actualWeight ?? 0;
    totalReps += reps;
    totalVolumeKg += reps * weight;
    repsByExercise[log.exerciseName] = (repsByExercise[log.exerciseName] ?? 0) + reps;
    volumeByExercise[log.exerciseName] =
      (volumeByExercise[log.exerciseName] ?? 0) + reps * weight;
  }

  const uniqueExercises = new Set(logs.map((l) => l.exerciseId));
  const totalSetsPlanned = snapshot.workout.exercises.reduce(
    (sum, ex) => sum + (ex.sets?.length ?? 1),
    0,
  );

  const lostTimeSeconds = Math.max(0, elapsedSeconds - activeSeconds - restSeconds);
  const avgSet =
    logs.length > 0 ? Math.round(activeSeconds / logs.length) : 0;

  return {
    totalReps,
    totalVolumeKg,
    activeTimeSeconds: activeSeconds,
    restTimeSeconds: restSeconds,
    lostTimeSeconds,
    exerciseCount: uniqueExercises.size,
    completedSets: logs.length,
    averageSetDurationSeconds: avgSet,
    workoutProgress: totalSetsPlanned > 0 ? logs.length / totalSetsPlanned : 0,
    repsByExercise,
    volumeByExercise,
  };
}

export function sumReps(logs: PerformedSetLog[]): number {
  return logs.reduce((s, l) => s + (l.actualReps ?? 0), 0);
}
