import { describe, expect, it } from "vitest";
import {
  estimateWarmupRestSeconds,
  lookupExerciseDefinition,
  normalizeExerciseKey,
} from "./exercises.js";

describe("exercises catalog", () => {
  it("trouve une définition par nom", () => {
    expect(lookupExerciseDefinition("Dead Hang")).toMatch(/Suspension/);
    expect(lookupExerciseDefinition("Traction lestée")).toMatch(/Tirage vertical/);
  });

  it("normalise les noms", () => {
    expect(normalizeExerciseKey("Scapular Pull-Up")).toBe("scapularpullup");
  });

  it("calcule le repos échauffement hold", () => {
    const rest = estimateWarmupRestSeconds({
      id: "1",
      name: "Dead Hang",
      format: "hold",
      sets: [{ setNumber: 1, durationSeconds: 20 }],
    });
    expect(rest).toBe(10);
  });

  it("calcule le repos échauffement explosif", () => {
    const rest = estimateWarmupRestSeconds({
      id: "1",
      name: "Explosive Pull-Up",
      format: "classic",
      sets: [{ setNumber: 1, targetReps: 5 }],
    });
    expect(rest).toBe(40);
  });

  it("calcule le repos selon les reps", () => {
    const rest = estimateWarmupRestSeconds({
      id: "1",
      name: "Band Face Pull",
      format: "classic",
      sets: [{ setNumber: 1, targetReps: 10 }],
    });
    expect(rest).toBe(15);
  });
});
