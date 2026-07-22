/**
 * Parcours utilisateur réel Driveely (navigateur Playwright).
 * Usage : set -a && source .env.local && set +a && npx tsx scripts/test-driveely-user-journey.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

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

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SECRET = process.env.SUPABASE_SECRET_KEY!;

const email = `driveely.browser.${Date.now()}@gmail.com`;
const password = "TestDriveely123!";
const name = "Browser Test";

type StepResult = { n: number; ok: boolean; fixed?: boolean; detail?: string };

const results: StepResult[] = [];

function adminHeaders() {
  return { apikey: SECRET, Authorization: `Bearer ${SECRET}` };
}

async function adminDeleteByEmail(targetEmail: string) {
  try {
    for (let pageNum = 1; pageNum <= 5; pageNum++) {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${pageNum}&per_page=200`, {
        headers: adminHeaders(),
      });
      const data = (await res.json()) as { users: { id: string; email?: string }[] };
      const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
      if (match) {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${match.id}`, {
          method: "DELETE",
          headers: adminHeaders(),
        });
        return;
      }
      if (data.users.length < 200) break;
    }
  } catch {
    // cleanup best-effort
  }
}

async function waitForDashboard(page: Page, timeout = 30_000) {
  await page.waitForURL(/\/demos\/driveely\/dashboard/, { timeout });
  await page.getByText("Centre de pilotage").waitFor({ timeout });
}

async function completeOnboarding(page: Page) {
  await page.getByText("Bienvenue sur Driveely").waitFor({ timeout: 15_000 });
  await page.getByRole("button", { name: /Continuer/i }).click();
  await page.getByRole("button", { name: "Passer" }).click();
  await page.getByRole("button", { name: /Continuer/i }).click();
  await page.getByRole("button", { name: /Continuer/i }).click();
  await page.getByRole("button", { name: "Passer" }).click();
  await page.getByRole("button", { name: /Continuer/i }).click();
  await page.getByRole("button", { name: "Passer" }).click();
  await page.getByRole("button", { name: /Accéder au dashboard/i }).click();
  await waitForDashboard(page);
}

async function runStep(n: number, fn: () => Promise<void>): Promise<boolean> {
  try {
    await fn();
    results.push({ n, ok: true });
    return true;
  } catch (e) {
    results.push({
      n,
      ok: false,
      detail: e instanceof Error ? e.message : String(e),
    });
    return false;
  }
}

function report() {
  for (const r of results) {
    if (r.ok && r.fixed) console.log(`✅ Étape ${r.n} (corrigée)`);
    else if (r.ok) console.log(`✅ Étape ${r.n}`);
    else console.log(`❌ Étape ${r.n}${r.fixed ? " (corrigée)" : ""}${r.detail ? ` — ${r.detail}` : ""}`);
  }
}

(async () => {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  const storagePath = path.join(__dirname, ".driveely-session.json");

  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();

    if (
      !(await runStep(1, async () => {
        await page!.goto(`${BASE}/demos/driveely/login?mode=signup`, { waitUntil: "networkidle" });
        await page!.getByLabel("Prénom").fill(name);
        await page!.getByLabel("Email").fill(email);
        await page!.getByLabel("Mot de passe").fill(password);
        await page!.getByRole("button", { name: /Créer mon compte/i }).click();
      }))
    ) {
      return;
    }

    if (
      !(await runStep(2, async () => {
        await page!.waitForURL(/\/demos\/driveely\/(onboarding|dashboard)/, { timeout: 45_000 });
        if (page!.url().includes("/login")) throw new Error(`Toujours sur login: ${page!.url()}`);
        const cookies = await context!.cookies();
        if (!cookies.some((c) => c.name.includes("auth-token"))) {
          throw new Error("Cookie session Supabase absent");
        }
      }))
    ) {
      return;
    }

    if (
      !(await runStep(3, async () => {
        await page!.waitForURL(/\/demos\/driveely\/onboarding/, { timeout: 15_000 });
        await page!.getByText("Bienvenue sur Driveely").waitFor();
      }))
    ) {
      return;
    }

    if (
      !(await runStep(4, async () => {
        await completeOnboarding(page!);
      }))
    ) {
      return;
    }

    if (
      !(await runStep(5, async () => {
        await waitForDashboard(page!);
        await page!.getByRole("heading", { name: /Salut Browser/i }).waitFor();
      }))
    ) {
      return;
    }

    if (
      !(await runStep(6, async () => {
        await page!.reload({ waitUntil: "networkidle" });
        await waitForDashboard(page!);
      }))
    ) {
      return;
    }

    if (
      !(await runStep(7, async () => {
        await context!.storageState({ path: storagePath });
        await context!.close();
        await browser!.close();
        browser = await chromium.launch({ headless: true });
        context = await browser.newContext({ storageState: storagePath });
        page = await context.newPage();
        await page.goto(`${BASE}/demos/driveely/dashboard`, { waitUntil: "networkidle" });
        await waitForDashboard(page);
      }))
    ) {
      return;
    }

    if (
      !(await runStep(8, async () => {
        await page!.goto(`${BASE}/demos/driveely/dashboard`, { waitUntil: "networkidle" });
        await waitForDashboard(page!);
        if (page!.url().includes("/login") || page!.url().includes("/onboarding")) {
          throw new Error(`Mauvaise URL: ${page!.url()}`);
        }
      }))
    ) {
      return;
    }

    if (
      !(await runStep(9, async () => {
        await page!.goto(`${BASE}/demos/driveely/deconnexion`, { waitUntil: "networkidle" });
        await page!.waitForURL(/\/demos\/driveely\/login/, { timeout: 15_000 });
      }))
    ) {
      return;
    }

    if (
      !(await runStep(10, async () => {
        await page!.getByLabel("Email").fill(email);
        await page!.getByLabel("Mot de passe").fill(password);
        await page!.getByRole("button", { name: /Se connecter/i }).click();
        await page!.waitForURL(/\/demos\/driveely\/(dashboard|onboarding)/, { timeout: 45_000 });
      }))
    ) {
      return;
    }

    await runStep(11, async () => {
      await waitForDashboard(page!);
      if (page!.url().includes("/onboarding")) {
        throw new Error("Renvoyé vers onboarding alors que terminé");
      }
      await page!.getByRole("heading", { name: /Salut Browser/i }).waitFor();
    });
  } finally {
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    if (fs.existsSync(storagePath)) fs.unlinkSync(storagePath);
    await adminDeleteByEmail(email);
    report();
    process.exitCode = results.some((r) => !r.ok) ? 1 : 0;
  }
})();
