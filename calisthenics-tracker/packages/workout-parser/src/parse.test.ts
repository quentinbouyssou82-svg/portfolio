import { describe, expect, it } from "vitest";
import { parseWorkoutMarkdown } from "./parse.js";
import { OFFICIAL_FORMAT_EXAMPLE } from "./format.js";

const HEADER = `# Workout
Name: Test Session
Goal: Strength
EstimatedDuration: 60

`;

function block(body: string): string {
  return `${HEADER}---\n\n## Block\n${body}`;
}

describe("parseWorkoutMarkdown", () => {
  it("parse l'exemple officiel", () => {
    const result = parseWorkoutMarkdown(OFFICIAL_FORMAT_EXAMPLE);
    expect(result.workout.title).toBe("Pull Strength");
    expect(result.workout.exercises).toHaveLength(2);
    expect(result.workout.exercises[0]?.name).toBe("Pull-Up");
    expect(result.workout.exercises[0]?.sets).toHaveLength(5);
    expect(result.workout.exercises[1]?.format).toBe("emom");
    expect(result.durationMs).toBeLessThan(100);
  });

  it("StraightSets", () => {
    const r = parseWorkoutMarkdown(
      block(`Type: StraightSets
Exercise: Pull-Up
Sets: 5
Reps: 5
Rest: 180
RIR: 2`),
    );
    const ex = r.workout.exercises[0]!;
    expect(ex.format).toBe("classic");
    expect(ex.sets).toHaveLength(5);
    expect(ex.sets![0]?.targetReps).toBe(5);
    expect(ex.sets![0]?.restAfterSeconds).toBe(180);
    expect(ex.sets![0]?.rir).toBe(2);
  });

  it("EMOM", () => {
    const r = parseWorkoutMarkdown(
      block(`Type: EMOM
Duration: 10
Exercise: Push-Up
RepsPerMinute: 10`),
    );
    const ex = r.workout.exercises[0]!;
    expect(ex.format).toBe("emom");
    expect(ex.sets).toHaveLength(10);
    expect(ex.timeCapSeconds).toBe(600);
    expect(ex.sets![0]?.targetReps).toBe(10);
  });

  it("Pyramid", () => {
    const r = parseWorkoutMarkdown(
      block(`Type: Pyramid
Exercise: Pull-Up
Reps: 1,2,3,4,5,4,3,2,1
Rest: 90`),
    );
    const ex = r.workout.exercises[0]!;
    expect(ex.format).toBe("pyramid");
    expect(ex.sets).toHaveLength(9);
    expect(ex.sets![4]?.targetReps).toBe(5);
  });

  it("Ladder", () => {
    const r = parseWorkoutMarkdown(
      block(`Type: Ladder
Exercise: Dips
Reps: 1-5
Rest: 60`),
    );
    const ex = r.workout.exercises[0]!;
    expect(ex.format).toBe("ladder");
    expect(ex.sets).toHaveLength(5);
    expect(ex.sets!.map((s) => s.targetReps)).toEqual([1, 2, 3, 4, 5]);
  });

  it("Superset (multi exercises)", () => {
    const r = parseWorkoutMarkdown(
      `${HEADER}---

## Block
Type: Superset
Group: A
Rest: 90

### Exercise
Exercise: Pull-Up
Sets: 3
Reps: 8

### Exercise
Exercise: Push-Up
Sets: 3
Reps: 12`,
    );
    expect(r.workout.exercises).toHaveLength(2);
    expect(r.workout.exercises[0]?.groupId).toBe("A");
    expect(r.workout.exercises[0]?.format).toBe("superset");
    expect(r.workout.exercises[1]?.name).toBe("Push-Up");
  });

  it("Circuit", () => {
    const r = parseWorkoutMarkdown(
      block(`Type: Circuit
Group: B
Exercise: Burpee
Sets: 4
Reps: 10
Rest: 45`),
    );
    expect(r.workout.exercises[0]?.format).toBe("circuit");
    expect(r.workout.exercises[0]?.groupId).toBe("B");
  });

  it("Hold", () => {
    const r = parseWorkoutMarkdown(
      block(`Type: Hold
Exercise: Plank
Duration: 60
Sets: 3
Rest: 30`),
    );
    const ex = r.workout.exercises[0]!;
    expect(ex.format).toBe("hold");
    expect(ex.sets).toHaveLength(3);
    expect(ex.sets![0]?.durationSeconds).toBe(60);
  });

  it("Weighted", () => {
    const r = parseWorkoutMarkdown(
      block(`Type: Weighted
Exercise: Pull-Up
Sets: 4
Reps: 6
Weight: 10
LoadUnit: kg
Rest: 120`),
    );
    const ex = r.workout.exercises[0]!;
    expect(ex.format).toBe("weighted");
    expect(ex.sets![0]?.targetWeight).toBe(10);
    expect(ex.sets![0]?.loadUnit).toBe("kg");
  });

  it("Bodyweight", () => {
    const r = parseWorkoutMarkdown(
      block(`Type: Bodyweight
Exercise: Push-Up
Sets: 3
Reps: 15
Rest: 60`),
    );
    const ex = r.workout.exercises[0]!;
    expect(ex.format).toBe("bodyweight");
    expect(ex.sets![0]?.loadUnit).toBe("bodyweight");
  });

  it("rejette un document sans blocs", () => {
    expect(() => parseWorkoutMarkdown("# Workout\nName: X")).toThrow(/bloc/i);
  });

  it("temps moyen < 100ms sur 200 parses", () => {
    const samples = [
      OFFICIAL_FORMAT_EXAMPLE,
      block(`Type: StraightSets\nExercise: A\nSets: 3\nReps: 10\nRest: 60`),
      block(`Type: EMOM\nDuration: 5\nExercise: B\nRepsPerMinute: 8`),
    ];
    const times: number[] = [];
    for (let i = 0; i < 200; i++) {
      const r = parseWorkoutMarkdown(samples[i % samples.length]!);
      times.push(r.durationMs);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);
    expect(avg).toBeLessThan(100);
    expect(max).toBeLessThan(200);
  });
});
