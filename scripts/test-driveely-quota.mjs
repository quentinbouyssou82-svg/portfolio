/**
 * Tests logique quotas free / premium.
 * Usage : node scripts/test-driveely-quota.mjs
 */

function buildQuotaStatus(premium, usedToday, dailyLimit = 5) {
  if (premium) {
    return { premium: true, dailyLimit: null, usedToday, remainingToday: null };
  }
  return {
    premium: false,
    dailyLimit,
    usedToday,
    remainingToday: Math.max(0, dailyLimit - usedToday),
  };
}

function isQuotaExceeded(usedToday, dailyLimit, premium) {
  if (premium) return false;
  return usedToday >= dailyLimit;
}

function resolvePremium(profile) {
  if (!profile.premium) return false;
  if (profile.premiumUntil && new Date(profile.premiumUntil) < new Date()) {
    return false;
  }
  return true;
}

const tests = [];
function assert(name, ok) {
  tests.push({ name, ok });
  console.log(ok ? "✓" : "✗", name);
}

// Free tier
assert("free 0/5 reste 5", buildQuotaStatus(false, 0).remainingToday === 5);
assert("free 4/5 reste 1", buildQuotaStatus(false, 4).remainingToday === 1);
assert("free 5/5 bloqué", isQuotaExceeded(5, 5, false));
assert("free 6/5 bloqué", isQuotaExceeded(6, 5, false));
assert("free 4/5 pas bloqué", !isQuotaExceeded(4, 5, false));

// Premium
assert("premium illimité", !isQuotaExceeded(100, 5, true));
assert("premium quota null", buildQuotaStatus(true, 10).dailyLimit === null);

// Expiration
assert(
  "premium expiré",
  !resolvePremium({
    premium: true,
    premiumUntil: "2020-01-01T00:00:00Z",
  }),
);
assert(
  "premium actif",
  resolvePremium({
    premium: true,
    premiumUntil: "2099-01-01T00:00:00Z",
  }),
);

const failed = tests.filter((t) => !t.ok).length;
console.log(`\n${tests.length - failed}/${tests.length} tests OK`);
process.exit(failed > 0 ? 1 : 0);
