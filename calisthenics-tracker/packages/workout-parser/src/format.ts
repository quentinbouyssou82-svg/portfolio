import type { WorkoutFormatType } from "@cali/types";

/** Types officiels du Markdown → format moteur. */
export const BLOCK_TYPE_TO_FORMAT: Record<string, WorkoutFormatType> = {
  straightsets: "classic",
  straight_sets: "classic",
  classic: "classic",
  emom: "emom",
  pyramid: "pyramid",
  reversepyramid: "reverse_pyramid",
  reverse_pyramid: "reverse_pyramid",
  ladder: "ladder",
  superset: "superset",
  circuit: "circuit",
  hold: "hold",
  isometric: "isometric",
  weighted: "weighted",
  bodyweight: "bodyweight",
  amrap: "amrap",
  fortime: "for_time",
  for_time: "for_time",
};

export const OFFICIAL_FORMAT_EXAMPLE = `# Workout

Name: Pull Strength

Goal: Force

EstimatedDuration: 70

---

## Block

Type: StraightSets

Exercise: Pull-Up

Sets: 5

Reps: 5

Rest: 180

RIR: 2

---

## Block

Type: EMOM

Duration: 10

Exercise: Push-Up

RepsPerMinute: 10`;
