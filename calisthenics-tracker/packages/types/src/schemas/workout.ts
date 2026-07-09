import { z } from "zod";

export const workoutFormatSchema = z.enum([
  "classic",
  "emom",
  "amrap",
  "for_time",
  "ladder",
  "pyramid",
  "reverse_pyramid",
  "superset",
  "circuit",
  "dropset",
  "cluster",
  "fixed_load",
  "progressive_load",
  "degressive",
  "time",
  "distance",
  "hold",
  "isometric",
  "weighted",
  "bodyweight",
  "tempo",
  "interval",
  "custom",
]);

export const loadUnitSchema = z.enum([
  "kg",
  "lb",
  "bodyweight",
  "percent_1rm",
  "rpe",
  "rir",
]);

export const tempoSpecSchema = z.object({
  eccentric: z.number().optional(),
  pauseBottom: z.number().optional(),
  concentric: z.number().optional(),
  pauseTop: z.number().optional(),
});

export const setSpecSchema = z.object({
  setNumber: z.number().int().positive(),
  targetReps: z.union([z.number(), z.string()]).optional(),
  targetWeight: z.number().optional(),
  loadUnit: loadUnitSchema.optional(),
  rpe: z.number().min(1).max(10).optional(),
  rir: z.number().min(0).max(10).optional(),
  tempo: z.union([tempoSpecSchema, z.string()]).optional(),
  restAfterSeconds: z.number().nonnegative().optional(),
  durationSeconds: z.number().nonnegative().optional(),
  distanceMeters: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export const exerciseBlockSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  format: workoutFormatSchema,
  instructions: z.string().optional(),
  sets: z.array(setSpecSchema).optional(),
  timeCapSeconds: z.number().nonnegative().optional(),
  groupId: z.string().optional(),
  estimatedWorkSeconds: z.number().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const parsedWorkoutSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  format: workoutFormatSchema,
  estimatedDurationSeconds: z.number().nonnegative().optional(),
  exercises: z.array(exerciseBlockSchema).min(1),
  rawNotes: z.string().optional(),
  warnings: z.array(z.string()).optional(),
});

export type ParsedWorkoutInput = z.input<typeof parsedWorkoutSchema>;
export type ParsedWorkoutOutput = z.output<typeof parsedWorkoutSchema>;
