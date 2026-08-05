/**
 * Auth stability against production Driveely — https://driveely.app
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   AUTH_CYCLES=5 npx tsx scripts/qa-driveely-auth-cycles.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium, type Browser, type Page } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUB =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SECRET =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Always prefer the live product domain unless explicitly overridden. */
const BASE = (
  process.env.DRIVEELY_QA_BASE ||
  "https://driveely.app"
).replace(/\/$/, "");
const CYCLES = Math.max(1, Number(process.env.AUTH_CYCLES || 5));

const FAIL_PATTERNS = [
  /This page couldn't load/i,
  /Application error/i,
  /Internal Server Error/i,
  /DEPLOYMENT_NOT_FOUND/i,
  /Unhandled Runtime Error/i,
  /Connexion impossible/i,
];

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

function adminHeaders() {
  return { apikey: SECRET, Authorization: `Bearer ${SECRET}` };
}

async function adminCreate(email: string, password: string, name: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`adminCreate: ${JSON.stringify(data)}`);
  return data.id as string;
}

async function patchProfile(userId: string, body: Record<string, unknown>) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`,
    {
      method: "PATCH",
      headers: {
        ...adminHeaders(),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`patchProfile: ${res.status} ${text}`);
  }
}

async function deleteUser(userId: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}

async function assertPageHealthy(page: Page, label: string) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(800);
  const body = await page.locator("body").innerText().catch(() => "");
  const url = page.url();

  if (/margeo\.vercel\.app/i.test(url)) {
    fail(label, `bounced to dead host ${url}`);
    throw new Error(`${label}: stale margeo.vercel.app redirect`);
  }

  for (const re of FAIL_PATTERNS) {
    if (re.test(body)) {
      fail(label, `matched ${re} at ${url}`);
      throw new Error(`${label}: fatal page content`);
    }
  }
  if (body.trim().length < 20) {
    await page.waitForTimeout(2500);
    const again = await page.locator("body").innerText().catch(() => "");
    if (again.trim().length < 20) {
      fail(label, `near-empty body at ${url}`);
      throw new Error(`${label}: blank page`);
    }
  }
  pass(label, url);
}

async function uiLogin(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await assertPageHealthy(page, "login page load");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /Se connecter/i }).click();

  // Continuing gate may flash "Connexion en cours…" before destination.
  // Fail fast if Vercel Retry / Connexion impossible appear during settle.
  const deadline = Date.now() + 75_000;
  while (Date.now() < deadline) {
    const body = await page.locator("body").innerText().catch(() => "");
    if (/This page couldn't load/i.test(body)) {
      fail("post-login settle", "Vercel couldn't load during gate");
      throw new Error("post-login: Vercel Retry page");
    }
    // English Retry alone on Vercel error pages (avoid FR false positives)
    if (/\bRetry\b/.test(body) && /couldn't load|Application error/i.test(body)) {
      fail("post-login settle", "Vercel Retry during gate");
      throw new Error("post-login: Vercel Retry page");
    }
    if (/Connexion impossible/i.test(body)) {
      fail("post-login settle", "Connexion impossible during gate");
      throw new Error("post-login: Connexion impossible");
    }
    const url = page.url();
    if (
      /driveely\.app\/(dashboard|onboarding|comment-ca-marche|analyse)/.test(
        url,
      )
    ) {
      break;
    }
    await page.waitForTimeout(400);
  }

  await page.waitForURL(
    /driveely\.app\/(dashboard|onboarding|comment-ca-marche|analyse)/,
    { timeout: 90_000 },
  );
  await assertPageHealthy(page, "post-login destination");
}

async function skipHowItWorksIfNeeded(page: Page) {
  if (!page.url().includes("comment-ca-marche")) return;
  for (let i = 0; i < 8; i++) {
    if (!page.url().includes("comment-ca-marche")) break;
    const btn = page.getByRole("button", {
      name: /Passer|Continuer|Aller|Commencer|C'est compris/i,
    });
    if (await btn.first().isVisible().catch(() => false)) {
      await btn.first().click();
      await page.waitForTimeout(400);
    } else break;
  }
  if (page.url().includes("comment-ca-marche")) {
    await page.evaluate(() => {
      document.cookie =
        "driveely_hiw_seen=1; path=/; max-age=31536000; SameSite=Lax";
    });
    await page.goto(`${BASE}/dashboard`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
  }
}

async function ensureDashboard(page: Page) {
  await skipHowItWorksIfNeeded(page);
  if (!page.url().includes("/dashboard")) {
    await page.goto(`${BASE}/dashboard`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
  }
  await page.waitForURL(/driveely\.app\/dashboard/, { timeout: 45_000 });
  await assertPageHealthy(page, "dashboard");
}

async function uiLogout(page: Page) {
  await page.goto(`${BASE}/deconnexion`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await page.waitForURL(/driveely\.app\/login/, { timeout: 45_000 });
  if (/margeo\.vercel\.app/i.test(page.url())) {
    fail("post-logout login", `redirected to ${page.url()}`);
    throw new Error("logout bounced to margeo.vercel.app");
  }
  await assertPageHealthy(page, "post-logout login");
}

async function assertLogoutHeader() {
  const res = await fetch(`${BASE}/deconnexion`, { redirect: "manual" });
  const loc = res.headers.get("location") ?? "";
  if (res.status >= 300 && res.status < 400) {
    if (/margeo\.vercel\.app/i.test(loc)) {
      fail("logout Location header", loc);
      throw new Error(`logout still points to dead host: ${loc}`);
    }
    if (/driveely\.app\/login/i.test(loc) || loc.startsWith("/login")) {
      pass("logout Location header", loc);
      return;
    }
    fail("logout Location header", `unexpected ${res.status} ${loc}`);
    throw new Error(`unexpected logout redirect: ${loc}`);
  }
  fail("logout Location header", `status=${res.status}`);
  throw new Error("logout did not redirect");
}

(async () => {
  console.log(`\n=== Driveely auth stability — ${BASE} — ${CYCLES} cycles ===\n`);

  if (!SUPABASE_URL || !PUB || !SECRET) {
    console.error("Missing Supabase env (URL / publishable / secret)");
    process.exit(1);
  }

  let browser: Browser | null = null;
  const email = `driveely.authcycle.${Date.now()}@gmail.com`;
  const password = "TestDriveelyAuth123!";
  let userId = "";

  try {
    await assertLogoutHeader();

    userId = await adminCreate(email, password, "Auth Cycle");
    await patchProfile(userId, {
      vehicle: "velo",
      cost_per_km: 0.05,
      target_hourly: 15,
      min_benefit: 6,
      max_distance_km: 8,
      empty_returns: "yes",
      weekly_hours: "20_30",
      name: "Auth Cycle",
      onboarding_completed: true,
    });
    pass("setup user + completed profile", userId);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await context.addCookies([
      {
        name: "driveely_hiw_seen",
        value: "1",
        domain: "driveely.app",
        path: "/",
        secure: true,
      },
    ]);
    const page = await context.newPage();

    page.on("pageerror", (err) => {
      fail("pageerror", err.message);
    });

    for (let i = 1; i <= CYCLES; i++) {
      console.log(`\n--- cycle ${i}/${CYCLES} ---`);
      await uiLogin(page, email, password);
      await ensureDashboard(page);

      await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
      await assertPageHealthy(page, `cycle ${i} refresh`);
      await page.waitForURL(/driveely\.app\/dashboard/, { timeout: 30_000 });

      await uiLogout(page);
      await uiLogin(page, email, password);
      await ensureDashboard(page);
      await uiLogout(page);
      pass(`cycle ${i} complete`);
    }

    await uiLogin(page, email, password);
    await ensureDashboard(page);
    await page.evaluate(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.waitForTimeout(500);
    await assertPageHealthy(page, "after visibilitychange");
    await uiLogout(page);
  } catch (e) {
    fail("fatal", e instanceof Error ? e.message : String(e));
  } finally {
    if (browser) await browser.close();
    if (userId) {
      try {
        await deleteUser(userId);
        pass("cleanup user");
      } catch {
        fail("cleanup user");
      }
    }
  }

  const failed = checks.filter((c) => !c.ok);
  const passed = checks.filter((c) => c.ok);
  console.log(
    `\n=== Result: ${passed.length} passed, ${failed.length} failed (cycles=${CYCLES}) ===\n`,
  );
  if (failed.length) {
    for (const f of failed) console.log(`  • ${f.id}: ${f.detail ?? ""}`);
    process.exit(1);
  }
  process.exit(0);
})();
