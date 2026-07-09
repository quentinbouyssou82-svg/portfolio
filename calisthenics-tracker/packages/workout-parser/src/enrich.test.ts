import { describe, expect, it } from "vitest";
import { enrichParsedWorkout, isWarmupExercise } from "./enrich.js";

const baseWorkout = {
  format: "classic" as const,
  exercises: [
    {
      id: "1",
      name: "Dead Hang",
      format: "hold" as const,
      groupId: "warmup",
      instructions: "Échauffement tour 1",
      sets: [{ setNumber: 1, durationSeconds: 20 }],
    },
    {
      id: "2",
      name: "Pull-Up",
      format: "weighted" as const,
      sets: [{ setNumber: 1, targetReps: 3, restAfterSeconds: 180 }],
    },
  ],
};

describe("enrichParsedWorkout", () => {
  it("marque les exercices warmup", () => {
    const enriched = enrichParsedWorkout(baseWorkout);
    expect(isWarmupExercise(enriched.exercises[0]!)).toBe(true);
    expect(enriched.exercises[0]?.metadata?.skipLog).toBe(true);
    expect(enriched.exercises[0]?.sets?.[0]?.restAfterSeconds).toBe(10);
    expect(isWarmupExercise(enriched.exercises[1]!)).toBe(false);
  });

  it("ajoute une définition d'exercice", () => {
    const enriched = enrichParsedWorkout(baseWorkout);
    expect(enriched.exercises[0]?.metadata?.definition).toMatch(/Suspension/);
    expect(enriched.exercises[1]?.metadata?.definition).toMatch(/Tirage/);
  });
});
