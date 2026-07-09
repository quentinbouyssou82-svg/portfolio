import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  checkOllamaHealth,
  OllamaUnavailableError,
  listOllamaModels,
} from "./ollama.js";

describe("ollama health", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects when Ollama is not running", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ECONNREFUSED"));
    const health = await checkOllamaHealth();
    expect(health.reachable).toBe(false);
    expect(health.message).toContain("pas lancé");
  });

  it("detects missing model", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ models: [{ name: "llama3" }] }),
    } as Response);

    const health = await checkOllamaHealth();
    expect(health.reachable).toBe(true);
    expect(health.modelAvailable).toBe(false);
    expect(health.availableModels).toContain("llama3");
  });

  it("lists models from tags endpoint", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        models: [{ name: "qwen2.5-coder:latest" }],
      }),
    } as Response);

    const models = await listOllamaModels("http://127.0.0.1:11434");
    expect(models[0]).toContain("qwen");
  });
});

describe("OllamaUnavailableError", () => {
  it("carries code and details", () => {
    const err = new OllamaUnavailableError("timeout", "TIMEOUT", { ms: 120000 });
    expect(err.code).toBe("TIMEOUT");
    expect(err.details).toEqual({ ms: 120000 });
  });
});
