import { parseJsonSafe, repairJsonText, extractJsonPayload } from "./json-repair.js";
import { describe, expect, it } from "vitest";

describe("json-repair", () => {
  it("extracts JSON from markdown fence", () => {
    const raw = '```json\n{"a":1}\n```';
    expect(extractJsonPayload(raw)).toBe('{"a":1}');
  });

  it("repairs trailing commas", () => {
    const result = parseJsonSafe<{ a: number }>('{"a":1,}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.a).toBe(1);
  });

  it("fails on completely invalid JSON", () => {
    const result = parseJsonSafe("not json at all");
    expect(result.ok).toBe(false);
  });

  it("repairs unquoted keys", () => {
    const fixed = repairJsonText("{name: \"test\"}");
    const result = parseJsonSafe(fixed);
    expect(result.ok).toBe(true);
  });
});
