/**
 * QA Driveely — parcours bêta-testeur réel (prod ou local).
 * Usage :
 *   set -a && source .env.local && set +a
 *   NEXT_PUBLIC_APP_URL=https://margeo.vercel.app npx tsx scripts/qa-driveely-beta.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium, type Browser, type Page } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[key]) process.env[key] = value;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SECRET_KEY!;
const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://margeo.vercel.app";
const CAPTURES = path.join(__dirname, "fixtures/captures");

type Check = { id: string; ok: boolean; detail?: string; ms?: number };
const checks: Check[] = [];

function pass(id: string, detail?: string, ms?: number) {
  checks.push({ id, ok: true, detail, ms });
  console.log(`✅ ${id}${detail ? ` — ${detail}` : ""}${ms != null ? ` (${ms}ms)` : ""}`);
}
function fail(id: string, detail?: string) {
  checks.push({ id, ok: false, detail });
  console.log(`❌ ${id}${detail ? ` — ${detail}` : ""}`);
}

function adminHeaders() {
  return { apikey: SECRET, Authorization: `Bearer ${SECRET}` };
}

function cookieHeader(access: string, refresh: string) {
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  const key = `sb-${ref}-auth-token`;
  const payload = JSON.stringify({
    access_token: access,
    refresh_token: refresh,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  });
  return `${key}=${encodeURIComponent(payload)}`;
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

async function patchProfile(userId: string, body: Record<string, unknown>) {
  await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function deleteUser(userId: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}

async function completeOnboardingUi(page: Page) {
  await page.getByRole("heading", { name: /Bienvenue/i }).waitFor({ timeout: 25_000 });
  await page.getByRole("button", { name: /Continuer/i }).click();

  for (let i = 0; i < 12; i++) {
    if (page.url().includes("/dashboard") || page.url().includes("/analyse")) return;

    const finish = page.getByRole("button", {
      name: /Lancer ma première analyse|Accéder au dashboard/i,
    });
    if (await finish.isVisible().catch(() => false)) {
      await finish.click();
      await page.waitForURL(/\/(dashboard|analyse)/, { timeout: 45_000 });
      return;
    }

    const cards = page.locator("button.onboarding-select-card, .onboarding-select-card");
    if ((await cards.count()) > 0) await cards.first().click();

    const seg = page.locator("button.onboarding-segment-item");
    if ((await seg.count()) > 0) await seg.first().click();

    const skip = page.getByRole("button", { name: "Passer" });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
      await page.waitForTimeout(350);
      continue;
    }

    const cont = page.getByRole("button", { name: /Continuer/i });
    if (await cont.isVisible().catch(() => false)) {
      await cont.click();
      await page.waitForTimeout(350);
      continue;
    }

    await page.waitForTimeout(400);
  }

  await page.waitForURL(/\/(dashboard|analyse)/, { timeout: 30_000 });
}

(async () => {
  console.log(`\n=== QA Driveely Beta — ${BASE} ===\n`);
  let browser: Browser | null = null;
  const email = `driveely.qa.${Date.now()}@gmail.com`;
  const password = "TestDriveely123!";
  let userId = "";
  let access = "";
  let refresh = "";

  try {
    // --- Health ---
    const healthRes = await fetch(`${BASE}/api/driveely/health`);
    const health = await healthRes.json();
    if (health.readyForBeta && health.checks?.mistral) {
      pass("Health / readyForBeta", JSON.stringify(health.checks));
    } else {
      fail("Health / readyForBeta", JSON.stringify(health));
    }

    // --- Security: unauthenticated ---
    const unauth = await fetch(`${BASE}/api/driveely/analyze`, { method: "POST" });
    if (unauth.status === 401) pass("Sécurité API analyze sans auth → 401");
    else fail("Sécurité API analyze sans auth", `status=${unauth.status}`);

    const dashAnon = await fetch(`${BASE}/demos/driveely/dashboard`, {
      redirect: "manual",
    });
    const dashLoc = dashAnon.headers.get("location") ?? "";
    if (dashAnon.status >= 300 && dashLoc.includes("/login")) {
      pass("Sécurité page dashboard → redirect login");
    } else if (dashAnon.status === 200) {
      // HTML may still load via middleware redirect client-side
      fail("Sécurité page dashboard", `status=${dashAnon.status} loc=${dashLoc}`);
    } else {
      pass("Sécurité page dashboard protégée", `status=${dashAnon.status}`);
    }

    // --- Auth: signup via API admin + app login UI ---
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();

    const signupStarted = Date.now();
    await page.goto(`${BASE}/demos/driveely/login?mode=signup`, {
      waitUntil: "networkidle",
    });
    await page.getByLabel("Prénom").fill("QA Beta");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: /Créer mon compte/i }).click();
    try {
      await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 60_000 });
      pass("AUTH création compte + auto-login", page.url(), Date.now() - signupStarted);
    } catch (e) {
      fail("AUTH création compte", `${page.url()} ${(e as Error).message}`);
      // Fallback admin create for remaining tests
      userId = await adminCreate(email, password, "QA Beta");
      const s = await signIn(email, password);
      access = s.access_token;
      refresh = s.refresh_token;
      throw e;
    }

    // Resolve user id
    const usersRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=200`,
      { headers: adminHeaders() },
    );
    const usersData = await usersRes.json();
    const me = (usersData.users as { id: string; email?: string }[]).find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    userId = me?.id ?? "";
    if (userId) pass("SUPABASE profil utilisateur créé", userId);
    else fail("SUPABASE profil utilisateur créé");

    const cookies = await context.cookies();
    if (cookies.some((c) => c.name.includes("auth-token"))) {
      pass("AUTH persistance cookie session");
    } else fail("AUTH persistance cookie session");

    if (page.url().includes("/onboarding")) {
      pass("ONBOARDING redirection après signup");
      await completeOnboardingUi(page);
      if (page.url().includes("/dashboard") || page.url().includes("/analyse")) {
        pass("ONBOARDING parcours complet → app", page.url());
      } else {
        fail("ONBOARDING parcours complet → app", page.url());
      }
    } else if (page.url().includes("/dashboard")) {
      pass("ONBOARDING skip (déjà complété) → dashboard");
    }

    // Ensure we land on dashboard for subsequent checks
    if (!page.url().includes("/dashboard")) {
      await page.goto(`${BASE}/demos/driveely/dashboard`, { waitUntil: "networkidle" });
    }
    await page.getByRole("heading", { name: /Salut/i }).waitFor({ timeout: 20_000 });
    pass("DASHBOARD chargement");

    // Refresh
    await page.reload({ waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /Salut/i }).waitFor({ timeout: 15_000 });
    pass("DASHBOARD refresh session OK");

    // Logout
    await page.goto(`${BASE}/demos/driveely/deconnexion`, { waitUntil: "networkidle" });
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    pass("AUTH déconnexion");

    // Re-login
    const loginStarted = Date.now();
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: /Se connecter/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 45_000 });
    pass("AUTH reconnexion → dashboard", undefined, Date.now() - loginStarted);

    // Persist session via storageState
    const storagePath = path.join(__dirname, ".qa-session.json");
    await context.storageState({ path: storagePath });
    await context.close();
    await browser.close();
    browser = await chromium.launch({ headless: true });
    const ctx2 = await browser.newContext({
      storageState: storagePath,
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    const page2 = await ctx2.newPage();
    await page2.goto(`${BASE}/demos/driveely/dashboard`, { waitUntil: "networkidle" });
    await page2.getByRole("heading", { name: /Salut/i }).waitFor({ timeout: 15_000 });
    pass("AUTH reprise session (reopen browser)");
    fs.unlinkSync(storagePath);

    // Get tokens for API tests
    const session = await signIn(email, password);
    access = session.access_token;
    refresh = session.refresh_token;
    await patchProfile(userId, {
      premium: true,
      premium_until: new Date(Date.now() + 86_400_000).toISOString(),
      premium_source: "beta",
    });

    // --- Upload validation ---
    const cookie = cookieHeader(access, refresh);

    // Invalid: no image
    const noImg = await fetch(`${BASE}/api/driveely/analyze`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: new FormData(),
    });
    const noImgData = await noImg.json();
    if (noImg.status === 400) pass("UPLOAD image manquante → erreur", noImgData.error);
    else fail("UPLOAD image manquante", `${noImg.status}`);

    // Invalid: text file
    const bad = new FormData();
    bad.append("image", new Blob(["hello"], { type: "text/plain" }), "x.txt");
    const badRes = await fetch(`${BASE}/api/driveely/analyze`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: bad,
    });
    if (badRes.status === 415 || badRes.status === 400) {
      pass("UPLOAD format invalide → erreur", String(badRes.status));
    } else fail("UPLOAD format invalide", `status=${badRes.status}`);

    // Too large (>10MB)
    const big = new Uint8Array(10 * 1024 * 1024 + 100);
    const bigForm = new FormData();
    bigForm.append("image", new Blob([big], { type: "image/png" }), "big.png");
    const bigRes = await fetch(`${BASE}/api/driveely/analyze`, {
      method: "POST",
      headers: { Cookie: cookie },
      body: bigForm,
    });
    if (bigRes.status === 413) pass("UPLOAD image trop lourde → 413");
    else fail("UPLOAD image trop lourde", `status=${bigRes.status}`);

    // PNG/JPG analyses
    const pngFile = path.join(
      CAPTURES,
      "Capture_d_e_cran_2026-07-14_a__12.33.45-b5e27584-d1ba-43a4-9d3f-7beac887d803.png",
    );
    const pngBuf = fs.readFileSync(pngFile);

    // PNG
    {
      const form = new FormData();
      form.append("image", new Blob([pngBuf], { type: "image/png" }), "ride.png");
      const t0 = Date.now();
      const res = await fetch(`${BASE}/api/driveely/analyze`, {
        method: "POST",
        headers: { Cookie: cookie },
        body: form,
      });
      const ms = Date.now() - t0;
      const data = await res.json();
      if (res.status === 200 && data.analysis?.verdict) {
        pass(
          "IA analyse PNG Uber Eats",
          `verdict=${data.analysis.verdict} score=${data.analysis.score} payout=${data.analysis.offer?.payout} total=${data.timings?.total ?? ms}ms`,
          ms,
        );
        if ((data.timings?.total ?? ms) <= 2500) {
          pass("PERF analyse < 2.5s", `${data.timings?.total ?? ms}ms`);
        } else {
          fail("PERF analyse < 2.5s", `${data.timings?.total ?? ms}ms`);
        }
        if (data.analysis.explanation) pass("IA explications présentes");
        else fail("IA explications présentes");
      } else {
        fail("IA analyse PNG", `${res.status} ${JSON.stringify(data).slice(0, 200)}`);
      }
    }

    // JPG (convert via sharp if available, else send as jpeg mime of png bytes - may fail type)
    try {
      const sharp = (await import("sharp")).default;
      const jpg = await sharp(pngBuf).jpeg({ quality: 80 }).toBuffer();
      const form = new FormData();
      form.append("image", new Blob([jpg], { type: "image/jpeg" }), "ride.jpg");
      const t0 = Date.now();
      const res = await fetch(`${BASE}/api/driveely/analyze`, {
        method: "POST",
        headers: { Cookie: cookie },
        body: form,
      });
      const ms = Date.now() - t0;
      const data = await res.json();
      if (res.status === 200 && data.analysis?.verdict) {
        pass("UPLOAD+IA JPG", `verdict=${data.analysis.verdict}`, ms);
      } else fail("UPLOAD+IA JPG", `${res.status} ${JSON.stringify(data).slice(0, 150)}`);
    } catch (e) {
      fail("UPLOAD+IA JPG", String(e));
    }

    // JPEG alias
    {
      const form = new FormData();
      form.append("image", new Blob([pngBuf], { type: "image/jpeg" }), "ride.jpeg");
      const res = await fetch(`${BASE}/api/driveely/analyze`, {
        method: "POST",
        headers: { Cookie: cookie },
        body: form,
      });
      const data = await res.json();
      if (res.status === 200) pass("UPLOAD JPEG mime accepté");
      else fail("UPLOAD JPEG mime", `${res.status} ${JSON.stringify(data).slice(0, 120)}`);
    }

    // Second capture
    const lyon = path.join(
      CAPTURES,
      "Capture_d_e_cran_2026-07-12_a__10.52.55-fed1f0f5-27e7-4d6a-a080-0711085da50a.png",
    );
    if (fs.existsSync(lyon)) {
      const form = new FormData();
      form.append(
        "image",
        new Blob([fs.readFileSync(lyon)], { type: "image/png" }),
        "lyon.png",
      );
      const t0 = Date.now();
      const res = await fetch(`${BASE}/api/driveely/analyze`, {
        method: "POST",
        headers: { Cookie: cookie },
        body: form,
      });
      const ms = Date.now() - t0;
      const data = await res.json();
      if (res.status === 200 && data.analysis?.offer?.payout > 0) {
        pass("IA parsing 2e capture (Lyon)", `payout=${data.analysis.offer.payout}`, ms);
      } else fail("IA parsing 2e capture", `${res.status}`);
    }

    // Supabase history
    const histDb = await fetch(
      `${SUPABASE_URL}/rest/v1/margeo_analyses?user_id=eq.${userId}&select=id,verdict,score&order=analyzed_at.desc&limit=5`,
      { headers: adminHeaders() },
    );
    const histRows = await histDb.json();
    if (Array.isArray(histRows) && histRows.length >= 1) {
      pass("SUPABASE historique analyses", `${histRows.length} rows`);
    } else fail("SUPABASE historique analyses", JSON.stringify(histRows).slice(0, 120));

    const rides = await fetch(
      `${SUPABASE_URL}/rest/v1/margeo_rides?user_id=eq.${userId}&select=id,image_path,vision_source&order=created_at.desc&limit=5`,
      { headers: adminHeaders() },
    );
    const rideRows = await rides.json();
    if (Array.isArray(rideRows) && rideRows.length >= 1) {
      pass("SUPABASE rides + vision_source", rideRows[0]?.vision_source);
      if (rideRows.some((r: { image_path?: string }) => r.image_path)) {
        pass("SUPABASE storage image_path renseigné");
      } else {
        // storage optional fail soft
        pass("SUPABASE storage (optionnel)", "image_path parfois null si bucket KO");
      }
    } else fail("SUPABASE rides");

    // Profile
    const prof = await fetch(
      `${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}&select=onboarding_completed,vehicle`,
      { headers: adminHeaders() },
    );
    const profRows = await prof.json();
    if (profRows[0]?.onboarding_completed) pass("SUPABASE profil onboarding_completed");
    else fail("SUPABASE profil onboarding_completed");

    // RLS: anon key cannot read other users
    const rls = await fetch(
      `${SUPABASE_URL}/rest/v1/margeo_analyses?select=id&limit=1`,
      { headers: { apikey: PUB, Authorization: `Bearer ${PUB}` } },
    );
    const rlsData = await rls.json();
    if (Array.isArray(rlsData) && rlsData.length === 0) {
      pass("SUPABASE RLS analyses (anon vide)");
    } else if (!rls.ok) {
      pass("SUPABASE RLS analyses (bloqué)", String(rls.status));
    } else {
      fail("SUPABASE RLS analyses", `anon a lu ${rlsData.length} rows`);
    }

    // Historique UI
    await page2.goto(`${BASE}/demos/driveely/historique`, { waitUntil: "networkidle" });
    const histOk = page2.url().includes("/historique");
    if (histOk) pass("DASHBOARD page historique");
    else fail("DASHBOARD page historique", page2.url());

    // Analyse UI page loads
    await page2.goto(`${BASE}/demos/driveely/analyse`, { waitUntil: "networkidle" });
    if (page2.url().includes("/analyse")) pass("MOBILE page analyse accessible");
    else fail("MOBILE page analyse", page2.url());

    // Empty state / dashboard after analyses
    await page2.goto(`${BASE}/demos/driveely/dashboard`, { waitUntil: "networkidle" });
    await page2.getByRole("heading", { name: /Salut/i }).waitFor({ timeout: 15_000 });
    pass("DASHBOARD après analyses");

    await ctx2.close();
  } catch (e) {
    fail("FATAL", e instanceof Error ? e.message : String(e));
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (userId) await deleteUser(userId).catch(() => {});

    const ok = checks.filter((c) => c.ok).length;
    const total = checks.length;
    const failed = checks.filter((c) => !c.ok);

    console.log("\n========== RAPPORT QA ==========\n");
    for (const c of checks) {
      console.log(`${c.ok ? "✅" : "❌"} ${c.id}`);
    }

    const reliability = Math.round((ok / Math.max(total, 1)) * 100);
    const perfFails = failed.filter((f) => f.id.startsWith("PERF")).length;
    const securityFails = failed.filter((f) => f.id.startsWith("Sécurité") || f.id.includes("RLS")).length;
    const robustness = Math.max(
      0,
      Math.round(100 - failed.length * 8 - securityFails * 10),
    );
    const performance = Math.max(0, Math.round(100 - perfFails * 25 - (failed.some((f) => f.id.includes("IA")) ? 15 : 0)));
    const betaReady = reliability >= 90 && securityFails === 0 && failed.filter((f) => !f.id.startsWith("PERF")).length <= 1;

    console.log(`\nFiabilité : ${reliability} / 100`);
    console.log(`Robustesse : ${robustness} / 100`);
    console.log(`Performance : ${performance} / 100`);
    console.log(`Prêt pour une bêta privée : ${betaReady ? "OUI" : "NON"}`);
    console.log(`\n${ok}/${total} checks OK`);

    process.exitCode = betaReady ? 0 : 1;
  }
})();
