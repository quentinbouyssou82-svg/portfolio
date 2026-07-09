import { describe, expect, it } from "vitest";
import { parseWorkoutMarkdown } from "./parse.js";
import {
  normalizeWorkoutInput,
  normalizeWorkoutInputDetailed,
} from "./normalize.js";

describe("normalizeWorkoutInput", () => {
  it("extrait le contenu d'un bloc ```markdown", () => {
    const raw = "Voici ta séance :\n\n```markdown\nType: StraightSets\nExercise: Push-Up\nSets: 3\nReps: 10\n```";
    const meta = normalizeWorkoutInputDetailed(raw);
    expect(meta.text).toContain("Type: StraightSets");
    expect(meta.text).not.toContain("```");
    expect(meta.transformations).toContain("markdown:code_fence_removed");
  });

  it("mappe Warmup → StraightSets", () => {
    const meta = normalizeWorkoutInputDetailed(`## Block
Type: Warmup
Exercise: Jumping Jacks
Sets: 1
Reps: 20`);
    expect(meta.text).toContain("Type: StraightSets");
    expect(meta.transformations.some((t) => t.includes("Warmup"))).toBe(true);
  });

  it("mappe warm-up → StraightSets", () => {
    const meta = normalizeWorkoutInputDetailed(`## Block
Type: Warm-up
Exercise: Arm Circles
Sets: 1
Reps: 10`);
    expect(meta.text).toContain("Type: StraightSets");
  });

  it("fallback type inconnu → StraightSets", () => {
    const meta = normalizeWorkoutInputDetailed(`## Block
Type: Finisher
Exercise: Burpee
Sets: 3
Reps: 10`);
    expect(meta.text).toContain("Type: StraightSets");
    expect(meta.warnings.some((w) => w.includes("Finisher"))).toBe(true);
  });

  it("reconstruit des blocs sans ## Block", () => {
    const raw = `Name: LLM Session
Goal: Force

Type: StraightSets
Exercise: Pull-Up
Sets: 3
Reps: 5

Type: EMOM
Duration: 5
Exercise: Push-Up
RepsPerMinute: 8`;

    const meta = normalizeWorkoutInputDetailed(raw);
    expect(meta.text).toContain("## Block");
    expect(meta.blockCount).toBe(2);
    expect(
      meta.warnings.some((w) =>
        w.includes("reconstructed"),
      ),
    ).toBe(true);
  });

  it("injecte ## Block avant Type: orphelin", () => {
    const raw = `Type: Circuit
Exercise: Burpee
Sets: 4
Reps: 10

## Block
Type: Hold
Exercise: Plank
Duration: 45
Sets: 3`;

    const meta = normalizeWorkoutInputDetailed(raw);
    expect(meta.blockCount).toBeGreaterThanOrEqual(2);
    expect(meta.text.match(/^##\s*Block/gim)?.length).toBeGreaterThanOrEqual(2);
  });

  it("supprime le texte narratif avant le premier ## Block", () => {
    const raw = `Sure! Here is your workout:

# Workout
Name: Test

Some random intro text from ChatGPT.

## Block
Type: Bodyweight
Exercise: Push-Up
Sets: 1
Reps: 10`;

    const meta = normalizeWorkoutInputDetailed(raw);
    expect(meta.text).toContain("Name: Test");
    expect(meta.text).not.toContain("Sure!");
    expect(meta.text).not.toContain("random intro");
    expect(meta.warnings).toContain("header:narrative_trimmed");
  });

  it("ne lève jamais d'exception", () => {
    expect(() => normalizeWorkoutInput("")).not.toThrow();
    expect(() => normalizeWorkoutInput("???")).not.toThrow();
  });

  it("pipeline normalize → parse accepte une sortie LLM variable", () => {
    const llmOutput = `\`\`\`markdown
Voici le programme :

Type: Warmup
Exercise: Jumping Jacks
Sets: 1
Reps: 30

Type: StraightSets
Exercise: Pull-Up
Sets: 4
Reps: 6
Rest: 120
\`\`\``;

    const normalized = normalizeWorkoutInput(llmOutput);
    const result = parseWorkoutMarkdown(normalized);
    expect(result.workout.exercises.length).toBeGreaterThanOrEqual(2);
    expect(result.workout.exercises[0]?.format).toBe("classic");
  });

  it("ne casse pas ## Block + séparateurs --- (régression Pull B)", () => {
    const pullB = `# Workout

Name: Pull B

EstimatedDuration: 4800

---

## Block

Type: Hold

Exercise: Dead Hang

Duration: 20

Sets: 2

Rest: 10

---

## Block

Type: Weighted

Exercise: Weighted Pull-Up

Sets: 6

Reps: 3

RIR: 2

Rest: 180`;

    const meta = normalizeWorkoutInputDetailed(pullB);
    expect(meta.blockCount).toBe(2);
    const result = parseWorkoutMarkdown(meta.text);
    expect(result.workout.exercises).toHaveLength(2);
  });

  it("répare un segment --- sans Type ni ## Block", () => {
    const raw = `## Block
Type: Hold
Exercise: Dead Hang
Duration: 20
Sets: 2

---

Exercise: Scapular Pull-Up
Sets: 2
Reps: 10`;

    const meta = normalizeWorkoutInputDetailed(raw);
    const result = parseWorkoutMarkdown(meta.text);
    expect(result.workout.exercises.length).toBeGreaterThanOrEqual(2);
    expect(meta.text).toContain("Type: StraightSets");
  });

  it("reste rapide (< 50ms sur 200 normalisations)", () => {
    const sample = `Type: Warmup
Exercise: A
Sets: 1
Reps: 10

Type: EMOM
Duration: 5
Exercise: B
RepsPerMinute: 8`;

    const times: number[] = [];
    for (let i = 0; i < 200; i++) {
      const t0 = performance.now();
      normalizeWorkoutInputDetailed(sample);
      times.push(performance.now() - t0);
    }
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    expect(avg).toBeLessThan(50);
  });
});
