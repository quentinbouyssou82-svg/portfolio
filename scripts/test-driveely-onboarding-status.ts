/**
 * Unit tests — resolveOnboardingStatus (pas de réseau).
 * Usage: npx tsx scripts/test-driveely-onboarding-status.ts
 */

import {
  resolveOnboardingStatus,
  needsOnboardingRepair,
} from "../lib/margeo/onboarding-status";

let failed = 0;

function assert(name: string, cond: boolean) {
  if (!cond) {
    failed++;
    console.log(`FAIL ${name}`);
  } else {
    console.log(`PASS ${name}`);
  }
}

const userMeta = {
  id: "u1",
  user_metadata: { onboarding_completed: true },
} as never;

assert(
  "db true → complete",
  resolveOnboardingStatus({ onboarding_completed: true }) === "complete",
);

assert(
  "null profile → unknown",
  resolveOnboardingStatus(null) === "unknown",
);

assert(
  "read error → unknown",
  resolveOnboardingStatus({ onboarding_completed: false }, null, {
    profileReadError: true,
  }) === "unknown",
);

assert(
  "false flag alone → incomplete",
  resolveOnboardingStatus({ onboarding_completed: false }) === "incomplete",
);

assert(
  "false flag + metadata → complete",
  resolveOnboardingStatus({ onboarding_completed: false }, userMeta) ===
    "complete",
);

assert(
  "false flag + signals → complete",
  resolveOnboardingStatus({
    onboarding_completed: false,
    vehicle: "velo",
    target_hourly: 15,
    empty_returns: "yes",
    weekly_hours: "20_30",
  }) === "complete",
);

assert(
  "needs repair when signals but flag false",
  needsOnboardingRepair({
    onboarding_completed: false,
    vehicle: "velo",
    target_hourly: 15,
    empty_returns: "yes",
    weekly_hours: "20_30",
  }) === true,
);

assert(
  "no repair when already true",
  needsOnboardingRepair({ onboarding_completed: true }) === false,
);

if (failed) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log("\nAll onboarding-status unit tests passed");
