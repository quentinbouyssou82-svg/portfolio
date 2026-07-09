import { describe, expect, it } from "vitest";
import type { ParsedWorkout } from "@cali/types";
import { createInitialSnapshot, transition, canDispatch } from "./transitions.js";

const sampleWorkout: ParsedWorkout = {
  title: "Test",
  format: "classic",
  exercises: [
    {
      id: "ex1",
      name: "Pull-up",
      format: "classic",
      sets: [
        { setNumber: 1, targetReps: 5, restAfterSeconds: 60 },
        { setNumber: 2, targetReps: 5, restAfterSeconds: 60 },
      ],
    },
    {
      id: "ex2",
      name: "Push-up",
      format: "classic",
      sets: [{ setNumber: 1, targetReps: 10, restAfterSeconds: 0 }],
    },
  ],
};

describe("state machine transitions", () => {
  it("flows READY → EXERCISE → WAITING → REST → EXERCISE → FINISHED", () => {
    let snap = createInitialSnapshot("s1", sampleWorkout);
    expect(snap.status).toBe("READY");

    snap = transition(snap, { type: "START" });
    expect(snap.status).toBe("EXERCISE");

    snap = transition(snap, { type: "FINISH_WORK" });
    expect(snap.status).toBe("WAITING_USER_INPUT");

    snap = transition(snap, {
      type: "SUBMIT_LOG",
      log: { actualReps: 5, rir: 2 },
    });
    expect(snap.status).toBe("REST");
    expect(snap.logs).toHaveLength(1);

    snap = transition(snap, { type: "REST_COMPLETE" });
    expect(snap.status).toBe("EXERCISE");
    expect(snap.position.setIndex).toBe(1);

    snap = transition(snap, { type: "FINISH_WORK" });
    snap = transition(snap, {
      type: "SUBMIT_LOG",
      log: { actualReps: 5 },
    });
    expect(snap.status).toBe("REST");

    snap = transition(snap, { type: "REST_COMPLETE" });
    expect(snap.position.exerciseIndex).toBe(1);

    snap = transition(snap, { type: "FINISH_WORK" });
    snap = transition(snap, {
      type: "SUBMIT_LOG",
      log: { actualReps: 10 },
    });
    expect(snap.status).toBe("FINISHED");
    expect(snap.logs).toHaveLength(3);
  });

  it("supports PAUSE and RESUME", () => {
    let snap = createInitialSnapshot("s1", sampleWorkout);
    snap = transition(snap, { type: "START" });
    snap = transition(snap, { type: "PAUSE" });
    expect(snap.status).toBe("PAUSED");
    expect(snap.statusBeforePause).toBe("EXERCISE");

    snap = transition(snap, { type: "RESUME" });
    expect(snap.status).toBe("EXERCISE");
    expect(snap.accumulatedPauseMs).toBeGreaterThanOrEqual(0);
  });

  it("guards invalid transitions", () => {
    const snap = createInitialSnapshot("s1", sampleWorkout);
    expect(canDispatch(snap.status, "SUBMIT_LOG")).toBe(false);
    expect(canDispatch(snap.status, "START")).toBe(true);
  });

  it("GO_BACK returns to previous exercise and clears its logs", () => {
    let snap = createInitialSnapshot("s1", sampleWorkout);
    snap = transition(snap, { type: "START" });
    snap = transition(snap, { type: "FINISH_WORK" });
    snap = transition(snap, { type: "SUBMIT_LOG", log: { actualReps: 5 } });
    snap = transition(snap, { type: "REST_COMPLETE" });
    snap = transition(snap, { type: "FINISH_WORK" });
    snap = transition(snap, { type: "SUBMIT_LOG", log: { actualReps: 5 } });
    snap = transition(snap, { type: "REST_COMPLETE" });
    expect(snap.position.exerciseIndex).toBe(1);

    snap = transition(snap, { type: "GO_BACK" });
    expect(snap.position.exerciseIndex).toBe(0);
    expect(snap.position.setIndex).toBe(0);
    expect(snap.status).toBe("EXERCISE");
    expect(snap.logs).toHaveLength(0);
  });

  it("GO_BACK on set 2 returns to set 1 of same exercise", () => {
    let snap = createInitialSnapshot("s1", sampleWorkout);
    snap = transition(snap, { type: "START" });
    snap = transition(snap, { type: "FINISH_WORK" });
    snap = transition(snap, { type: "SUBMIT_LOG", log: { actualReps: 5 } });
    snap = transition(snap, { type: "REST_COMPLETE" });
    expect(snap.position.setIndex).toBe(1);

    snap = transition(snap, { type: "GO_BACK" });
    expect(snap.position.exerciseIndex).toBe(0);
    expect(snap.position.setIndex).toBe(0);
    expect(snap.logs).toHaveLength(0);
  });
});
