import { describe, expect, it } from "vitest";
import {
  formatDuration,
  isSessionExpired,
} from "./session-shared.js";
import {
  generateSessionToken,
  hashPin,
  verifyPin,
} from "./auth-server.js";

describe("auth-server", () => {
  it("verifies correct PIN", () => {
    expect(verifyPin("0610", "0610", "test-secret")).toBe(true);
  });

  it("rejects incorrect PIN", () => {
    expect(verifyPin("0000", "0610", "test-secret")).toBe(false);
  });

  it("generates unique session tokens", () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });

  it("hashes PIN deterministically", () => {
    expect(hashPin("0610", "secret")).toBe(hashPin("0610", "secret"));
    expect(hashPin("0610", "other")).not.toBe(hashPin("0610", "secret"));
  });
});

describe("session-shared", () => {
  it("detects expired sessions", () => {
    const past = new Date(Date.now() - 1000).toISOString();
    expect(isSessionExpired(past)).toBe(true);
    const future = new Date(Date.now() + 60_000).toISOString();
    expect(isSessionExpired(future)).toBe(false);
  });
});

describe("formatDuration", () => {
  it("formats mm:ss", () => {
    expect(formatDuration(125)).toBe("2:05");
  });

  it("formats hh:mm:ss", () => {
    expect(formatDuration(3661)).toBe("1:01:01");
  });
});
