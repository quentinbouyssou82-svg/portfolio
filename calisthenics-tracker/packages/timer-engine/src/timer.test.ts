import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { TimerEngine } from "./timer.js";

describe("TimerEngine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down and completes", () => {
    const engine = new TimerEngine("test");
    const completes: number[] = [];
    engine.onComplete(() => completes.push(1));
    engine.start(3, "work");

    expect(engine.getSnapshot().remainingSeconds).toBe(3);

    vi.advanceTimersByTime(3000);
    expect(engine.getSnapshot().status).toBe("completed");
    expect(completes).toHaveLength(1);
  });

  it("pauses and resumes", () => {
    const engine = new TimerEngine("test");
    engine.start(10, "rest");
    vi.advanceTimersByTime(2000);
    engine.pause();
    const pausedRemaining = engine.getSnapshot().remainingSeconds;

    vi.advanceTimersByTime(5000);
    expect(engine.getSnapshot().remainingSeconds).toBe(pausedRemaining);

    engine.resume();
    vi.advanceTimersByTime(1000);
    expect(engine.getSnapshot().remainingSeconds).toBeLessThan(pausedRemaining);
  });

  it("skip finishes immediately", () => {
    const engine = new TimerEngine("test");
    engine.start(60, "work");
    engine.skip();
    expect(engine.getSnapshot().status).toBe("completed");
  });
});
