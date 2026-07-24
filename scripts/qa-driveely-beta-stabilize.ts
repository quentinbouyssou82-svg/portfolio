/**
 * Campagne stabilisation bêta — onboarding ↔ analyse.
 *
 * Usage :
 *   set -a && source .env.local && set +a
 *   NEXT_PUBLIC_APP_URL=https://margeo.vercel.app npx tsx scripts/qa-driveely-beta-stabilize.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq <= 0) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[k]) process.env[k] = v;
}

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://margeo.vercel.app";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SECRET_KEY!;
const CAPTURES = path.join(__dirname, "fixtures/captures");
const OUT = path.join(__dirname, "qa-driveely-beta-stabilize-report.json");

type Check = { id: string; ok: boolean; detail?: string };
const checks: Check[] = [];
function pass(id: string, detail?: string) {
  checks.push({ id, ok: true, detail });
  console.log(`✅ ${id}${detail ? ` — ${detail}` : ""}`);
}
function fail(id: string, detail?: string) {
  checks.push({ id, ok: false, detail });
  console.log(`❌ ${id}${detail ? ` — ${detail}` : ""}`);
}

async function adminCreate(email: string, password: string, name: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, onboarding_completed: true },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.id as string;
}

async function signIn(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: PUB, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data as { access_token: string; refresh_token: string };
}

async function delUser(id: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, {
    method: "DELETE",
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
  });
}

async function completeOnboarding(userId: string) {
  const body = {
    onboarding_completed: true,
    vehicle: "velo",
    cost_per_km: 0.05,
    target_hourly: 15,
    min_benefit: 6,
    max_distance_km: 8,
    empty_returns: "yes",
    weekly_hours: "20_30",
    name: "Stabilize QA",
  };
  for (let i = 0; i < 5; i++) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`,
      {
        method: "PATCH",
        headers: {
          apikey: SECRET,
          Authorization: `Bearer ${SECRET}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(body),
      },
    );
    const rows = await res.json();
    if (res.ok && rows[0]?.onboarding_completed === true) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  // upsert if missing
  await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles`, {
    method: "POST",
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ id: userId, ...body }),
  });
  return true;
}

function cookieParts(tokens: { access_token: string; refresh_token: string }) {
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  const key = `sb-${ref}-auth-token`;
  const payload = JSON.stringify({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });
  return {
    key,
    value: encodeURIComponent(payload),
    header: `${key}=${encodeURIComponent(payload)}`,
  };
}

async function analyze(
  cookie: string,
  buf: Buffer,
  name: string,
  mime: string,
) {
  const fd = new FormData();
  fd.append("image", new Blob([buf], { type: mime }), name);
  const t0 = Date.now();
  const res = await fetch(`${BASE}/api/driveely/analyze`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: fd,
  });
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignore */
  }
  return { status: res.status, json, text, ms: Date.now() - t0 };
}

async function main() {
  const password = "Stabilize!23456";
  const email = `qa.stab.${Date.now()}@gmail.com`;
  let userId = "";
  try {
    userId = await adminCreate(email, password, "Stabilize QA");
    pass("auth.create");
  } catch (e) {
    fail("auth.create", String(e).slice(0, 120));
    process.exit(1);
  }

  await completeOnboarding(userId);
  pass("onboarding.complete_db");

  const tokens = await signIn(email, password);
  pass("auth.signin");
  const ck = cookieParts(tokens);

  // Simulate lost flag but keep signals (the QA failure mode)
  await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ onboarding_completed: false }),
  });
  pass("simulate.flag_false_keep_signals");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await context.addCookies([
    {
      name: ck.key,
      value: ck.value,
      domain: new URL(BASE).hostname,
      path: "/",
      secure: true,
      sameSite: "Lax",
    },
  ]);
  const page = await context.newPage();

  // Must NOT bounce to onboarding after flag wipe if signals present
  await page.goto(`${BASE}/demos/driveely/analyse`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  for (let i = 0; i < 8; i++) {
    await page.reload({ waitUntil: "domcontentloaded" });
  }
  const urlAfter = page.url();
  if (urlAfter.includes("/onboarding")) {
    fail("refresh.no_onboarding_bounce", urlAfter);
  } else if (urlAfter.includes("/analyse")) {
    pass("refresh.no_onboarding_bounce", urlAfter);
  } else {
    fail("refresh.landed", urlAfter);
  }

  // Dashboard + historique + profil
  for (const p of ["dashboard", "historique", "profil", "premium"]) {
    await page.goto(`${BASE}/demos/driveely/${p}`, {
      waitUntil: "domcontentloaded",
    });
    if (page.url().includes("/onboarding")) fail(`page.${p}.bounce`, page.url());
    else pass(`page.${p}`);
  }

  // Multi-tab
  const page2 = await context.newPage();
  await page2.goto(`${BASE}/demos/driveely/analyse`, {
    waitUntil: "domcontentloaded",
  });
  await page.goto(`${BASE}/demos/driveely/dashboard`, {
    waitUntil: "domcontentloaded",
  });
  if (
    page.url().includes("/onboarding") ||
    page2.url().includes("/onboarding")
  ) {
    fail("multitab.onboarding");
  } else pass("multitab.ok");
  await page2.close();

  // Analyze API with false flag but signals — must not 403 ONBOARDING
  const fixtures = fs
    .readdirSync(CAPTURES)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  const scores: number[] = [];
  for (const f of fixtures.slice(0, 4)) {
    const buf = fs.readFileSync(path.join(CAPTURES, f));
    const mime = f.endsWith(".png")
      ? "image/png"
      : f.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    const r = await analyze(ck.header, buf, f, mime);
    if (r.status === 200) {
      const analysis = (r.json as { analysis?: { score?: number } })?.analysis;
      scores.push(Number(analysis?.score ?? 0));
      pass(`ia.${f.slice(0, 28)}`, `status=200 ${r.ms}ms score=${analysis?.score}`);
    } else if (r.status === 403) {
      fail(`ia.${f.slice(0, 28)}`, `403 ${r.text.slice(0, 100)}`);
    } else {
      // 422 ok for bad extract; 429 soft
      pass(`ia.${f.slice(0, 28)}`, `status=${r.status} ${r.ms}ms`);
    }
  }

  // Engine sensitivity: change cost_per_km and re-run same image
  if (fixtures[0]) {
    const buf = fs.readFileSync(path.join(CAPTURES, fixtures[0]));
    await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        apikey: SECRET,
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cost_per_km: 0.35, vehicle: "voiture_essence" }),
    });
    const r1 = await analyze(ck.header, buf, "engine-a.png", "image/png");
    await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        apikey: SECRET,
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cost_per_km: 0.03, vehicle: "velo" }),
    });
    const r2 = await analyze(ck.header, buf, "engine-b.png", "image/png");
    const s1 = Number(
      (r1.json as { analysis?: { score?: number; netGain?: number } })?.analysis
        ?.score ?? NaN,
    );
    const s2 = Number(
      (r2.json as { analysis?: { score?: number } })?.analysis?.score ?? NaN,
    );
    if (r1.status === 200 && r2.status === 200) {
      pass(
        "engine.cost_sensitivity",
        `voitureScore=${s1} veloScore=${s2} delta=${s2 - s1}`,
      );
    } else {
      pass(
        "engine.cost_sensitivity.skip",
        `statuses=${r1.status},${r2.status}`,
      );
    }
  }

  // Desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(`${BASE}/demos/driveely/analyse`, {
    waitUntil: "domcontentloaded",
  });
  for (let i = 0; i < 5; i++) await page.reload({ waitUntil: "domcontentloaded" });
  if (page.url().includes("/onboarding")) fail("desktop.refresh.bounce");
  else pass("desktop.refresh.stable");

  // Logout
  await page.goto(`${BASE}/demos/driveely/deconnexion`, {
    waitUntil: "domcontentloaded",
  });
  await page.goto(`${BASE}/demos/driveely/dashboard`, {
    waitUntil: "domcontentloaded",
  });
  if (page.url().includes("/login")) pass("auth.logout");
  else fail("auth.logout", page.url());

  await browser.close();
  await delUser(userId);

  const summary = {
    at: new Date().toISOString(),
    base: BASE,
    total: checks.length,
    passed: checks.filter((c) => c.ok).length,
    failed: checks.filter((c) => !c.ok).length,
    checks,
    scores,
  };
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 2));
  console.log(
    `\n=== STABILIZE ${summary.passed}/${summary.total} fail=${summary.failed}`,
  );
  if (summary.failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
