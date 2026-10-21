/**
 * Tests unitaires format + mapping erreurs redeem (sans réseau).
 * Usage: npx tsx scripts/test-driveely-beta-codes.ts
 */

import assert from "node:assert/strict";
import {
  formatBetaCodeDisplay,
  generateBetaCode,
  isCompleteBetaCode,
  normalizeBetaCode,
} from "../lib/margeo/services/beta-codes";

assert.equal(normalizeBetaCode("ab7-kq2"), "AB7KQ2");
assert.equal(normalizeBetaCode("  ab7kq2  "), "AB7KQ2");
assert.equal(normalizeBetaCode("TOOLONG12"), "TOOLON");
assert.equal(isCompleteBetaCode("AB7KQ2"), true);
assert.equal(isCompleteBetaCode("AB7"), false);
assert.equal(isCompleteBetaCode("ab7kq2"), false);
assert.equal(formatBetaCodeDisplay("ab7kq2"), "AB7-KQ2");
assert.equal(formatBetaCodeDisplay("DRV-DEMO"), "DRV-DEM");

const a = generateBetaCode();
const b = generateBetaCode();
assert.equal(a.length, 6);
assert.match(a, /^[A-Z0-9]{6}$/);
assert.notEqual(a, b);

console.log("✅ beta codes format OK");
