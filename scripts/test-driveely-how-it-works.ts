/**
 * Lightweight sanity checks for how-it-works routing helpers.
 * Run: npx tsx scripts/test-driveely-how-it-works.ts
 */
import assert from "node:assert/strict";

process.env.NEXT_PUBLIC_DRIVEELY_AT_ROOT = "true";

async function main() {
  // Dynamic import after env so DRIVEELY_PATHS resolve at root.
  const {
    buildHowItWorksPath,
    resolveHowItWorksNext,
    howItWorksCookieSeen,
    isHowItWorksCookieValue,
    HOW_IT_WORKS_COOKIE,
  } = await import("../lib/margeo/how-it-works");
  const { DRIVEELY_PATHS } = await import("../lib/margeo/constants");

  assert.equal(DRIVEELY_PATHS.howItWorks, "/comment-ca-marche");
  assert.equal(DRIVEELY_PATHS.onboarding, "/onboarding");

  const path = buildHowItWorksPath(DRIVEELY_PATHS.onboarding);
  assert.equal(
    path,
    "/comment-ca-marche?next=%2Fonboarding",
    "post-signup tour path",
  );

  assert.equal(
    resolveHowItWorksNext("%2Fonboarding"),
    "/onboarding",
  );
  assert.equal(
    resolveHowItWorksNext("/dashboard"),
    "/dashboard",
  );
  assert.equal(
    resolveHowItWorksNext("/evil"),
    "/onboarding",
  );

  assert.equal(isHowItWorksCookieValue("1"), true);
  assert.equal(isHowItWorksCookieValue("0"), false);
  assert.equal(isHowItWorksCookieValue(undefined), false);
  assert.equal(
    howItWorksCookieSeen(`${HOW_IT_WORKS_COOKIE}=1; other=x`),
    true,
  );
  assert.equal(howItWorksCookieSeen("other=1"), false);

  // Routing contract: missing cookie ⇒ tour stays reachable (no skip).
  assert.equal(isHowItWorksCookieValue(null), false);
  assert.equal(howItWorksCookieSeen(""), false);
  assert.equal(howItWorksCookieSeen(undefined), false);

  console.log("ok — how-it-works helpers");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
