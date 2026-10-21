/**
 * Tests unitaires du circuit breaker Mistral.
 * Usage : npx tsx scripts/test-mistral-circuit-breaker.ts
 */

import {
  evaluateMistralCircuitBreaker,
  getMistralCircuitBreakerConfig,
  recordMistralCall,
} from "../lib/margeo/security/mistral-circuit-breaker";

const saved = { ...process.env };
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  Object.assign(process.env, saved);
  try {
    fn();
    console.log("✓", name);
    passed += 1;
  } catch (e) {
    console.log("✗", name, e instanceof Error ? e.message : e);
    failed += 1;
  }
}

test("limit 0 = circuit breaker désactivé", () => {
  process.env.MISTRAL_DAILY_CALL_LIMIT = "0";
  process.env.MISTRAL_CIRCUIT_BREAKER_MODE = "strict";
  const status = evaluateMistralCircuitBreaker();
  if (status.tripped) throw new Error("should not trip");
});

test("log_only : tripped mais shouldBlock false", () => {
  process.env.MISTRAL_DAILY_CALL_LIMIT = "2";
  process.env.MISTRAL_CIRCUIT_BREAKER_MODE = "log_only";
  recordMistralCall();
  recordMistralCall();
  const status = evaluateMistralCircuitBreaker();
  if (!status.tripped) throw new Error("expected tripped");
  if (status.shouldBlock) throw new Error("should not block in log_only");
});

test("strict : shouldBlock true au seuil", () => {
  process.env.MISTRAL_DAILY_CALL_LIMIT = "1";
  process.env.MISTRAL_CIRCUIT_BREAKER_MODE = "strict";
  recordMistralCall();
  const status = evaluateMistralCircuitBreaker();
  if (!status.shouldBlock) throw new Error("expected block in strict");
});

test("config parse défaut log_only", () => {
  delete process.env.MISTRAL_CIRCUIT_BREAKER_MODE;
  const cfg = getMistralCircuitBreakerConfig();
  if (cfg.mode !== "log_only") throw new Error(`expected log_only got ${cfg.mode}`);
});

console.log(`\n${passed}/${passed + failed} tests OK`);
process.exit(failed > 0 ? 1 : 0);
