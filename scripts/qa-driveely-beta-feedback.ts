/**
 * QA retours bêta-testeur : dates, numériques, import, véhicule.
 * Usage :
 *   set -a && source .env.local && set +a
 *   NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000 npx tsx scripts/qa-driveely-beta-feedback.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium, devices, type Page } from "playwright";
import { estimateCostPerKm } from "../lib/margeo/vehicle-details";

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
const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

async function adminCreate(email: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { ...adminHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "QA Feedback" },
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

async function deleteUser(userId: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
}

async function loginUi(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/demos/driveely/login`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /Se connecter|Connexion/i }).click();
  await page.waitForURL(/\/(dashboard|analyse|onboarding|profil)/, {
    timeout: 60000,
  });
  if (page.url().includes("/onboarding")) {
    // Fallback : forcer via UI rapide
    await page.getByRole("button", { name: /Continuer/i }).click().catch(() => {});
    for (let i = 0; i < 14; i++) {
      if (!page.url().includes("/onboarding")) break;
      const finish = page.getByRole("button", {
        name: /Lancer ma première analyse|Accéder au dashboard/i,
      });
      if (await finish.isVisible().catch(() => false)) {
        await finish.click();
        break;
      }
      const cards = page.locator(
        "button.onboarding-select-card, .onboarding-select-card",
      );
      if ((await cards.count()) > 0) await cards.first().click();
      const skip = page.getByRole("button", { name: "Passer" });
      if (await skip.isVisible().catch(() => false)) {
        await skip.click();
        continue;
      }
      const cont = page.getByRole("button", { name: /Continuer/i });
      if (await cont.isVisible().catch(() => false)) await cont.click();
      await page.waitForTimeout(250);
    }
    await page.waitForURL(/\/(dashboard|analyse)/, { timeout: 45000 });
  }
}

async function testNumericField(
  page: Page,
  label: string,
  typed = "12.5",
  expectAfterBlur?: string,
) {
  const field = page.getByLabel(label, { exact: false }).first();
  await field.waitFor({ state: "visible", timeout: 15000 });
  await field.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  const empty = await field.inputValue();
  if (empty !== "") {
    fail(`numeric-clear:${label}`, `attendu vide, got "${empty}"`);
    return;
  }
  await field.type(typed);
  const typedVal = await field.inputValue();
  if (typedVal !== typed) {
    fail(`numeric-type:${label}`, `attendu ${typed}, got "${typedVal}"`);
    return;
  }
  await field.blur();
  const committed = await field.inputValue();
  const expected = expectAfterBlur ?? typed;
  if (committed !== expected && !committed.startsWith(expected)) {
    fail(`numeric-commit:${label}`, `got "${committed}" expected "${expected}"`);
    return;
  }
  pass(`numeric:${label}`, committed);
}

async function main() {
  console.log(`QA beta feedback → ${BASE}\n`);

  // 0. Unit: coût/km
  const cost = estimateCostPerKm("voiture_essence", {
    fuel: "essence",
    consumptionPer100Km: 7,
    energyPrice: 1.8,
    costPerKmManual: false,
  });
  if (cost > 0.1 && cost < 1) pass("unit:estimateCostPerKm", `${cost} €/km`);
  else fail("unit:estimateCostPerKm", String(cost));

  const email = `driveely.feedback.${Date.now()}@gmail.com`;
  const password = "TestDriveely123!";
  let userId = "";

  const browser = await chromium.launch({ headless: true });
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const iphone = await browser.newContext({
    ...devices["iPhone 13"],
  });
  const android = await browser.newContext({
    ...devices["Pixel 7"],
  });

  try {
    userId = await adminCreate(email, password);
    // Attendre le trigger profil puis forcer onboarding done
    for (let attempt = 0; attempt < 8; attempt++) {
      const upsert = await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles`, {
        method: "POST",
        headers: {
          ...adminHeaders(),
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({
          id: userId,
          onboarding_completed: true,
          name: "QA Feedback",
          vehicle: "voiture_essence",
          cost_per_km: 0.28,
          target_hourly: 18,
          daily_target: 120,
        }),
      });
      const patch = await fetch(
        `${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`,
        {
          method: "PATCH",
          headers: {
            ...adminHeaders(),
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({ onboarding_completed: true }),
        },
      );
      const body = await patch.json().catch(() => []);
      const rows = Array.isArray(body) ? body : [];
      if (upsert.ok && rows[0]?.onboarding_completed === true) break;
      await new Promise((r) => setTimeout(r, 300));
    }

    // 1. Landing dates (desktop)
    {
      const page = await desktop.newPage();
      await page.goto(`${BASE}/demos/driveely`, { waitUntil: "networkidle" });
      const text = await page.locator("body").innerText();
      const recent =
        /aujourd'hui|hier|il y a \d+ h|il y a \d+ jours?|cette semaine/i.test(
          text,
        );
      const oldDates = /il y a \d+ (semaines?|mois)/i.test(text);
      const fakeDemo =
        (await page.locator("#demo").count()) > 0 ||
        text.includes("Essayez la démo");
      if (recent && !oldDates) pass("landing:dates-recentes");
      else fail("landing:dates-recentes", text.slice(0, 200));
      if (!fakeDemo) pass("landing:pas-demo-fake");
      else fail("landing:pas-demo-fake");
      await page.close();
    }

    // 2–4. Auth + analyse + profil on each viewport
    for (const [name, ctx] of [
      ["desktop", desktop],
      ["iphone", iphone],
      ["android", android],
    ] as const) {
      const page = await ctx.newPage();
      try {
        await loginUi(page, email, password);
      } catch (e) {
        fail(`${name}:auth`, `${page.url()} ${String(e)}`);
        await page.close();
        continue;
      }

      await page.goto(`${BASE}/demos/driveely/analyse`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForTimeout(800);

      if (page.url().includes("/login") || page.url().includes("/onboarding")) {
        fail(`${name}:auth`, page.url());
        await page.close();
        continue;
      }
      pass(`${name}:auth`);

      // Upload controls
      const photo = page.getByRole("button", { name: /^Photo$/i });
      const gallery = page.getByRole("button", { name: /^Galerie$/i });
      const fileBtn = page.getByRole("button", { name: /^Fichier$/i });
      const hasButtons =
        (await photo.count()) > 0 &&
        (await gallery.count()) > 0 &&
        (await fileBtn.count()) > 0;
      if (hasButtons) pass(`${name}:import-boutons`);
      else fail(`${name}:import-boutons`);

      const inputs = await page.evaluate(() => {
        const list = [...document.querySelectorAll('input[type="file"]')];
        return list.map((el) => ({
          capture: el.getAttribute("capture"),
          accept: el.getAttribute("accept") || "",
        }));
      });
      const withCapture = inputs.filter((i) => i.capture);
      const withoutCapture = inputs.filter((i) => !i.capture);
      if (withCapture.length >= 1 && withoutCapture.length >= 1) {
        pass(
          `${name}:import-inputs`,
          `capture=${withCapture.length} libre=${withoutCapture.length}`,
        );
      } else {
        fail(`${name}:import-inputs`, JSON.stringify(inputs));
      }

      const mainHasCapture = await page.evaluate(() => {
        const inputs = [
          ...document.querySelectorAll('input[type="file"]'),
        ] as HTMLInputElement[];
        const gallery = inputs.find(
          (i) => !i.capture && i.accept.includes("image"),
        );
        return {
          galleryCapture: gallery?.getAttribute("capture"),
          count: inputs.length,
        };
      });
      if (mainHasCapture.galleryCapture == null) {
        pass(`${name}:import-zone-sans-capture`);
      } else {
        fail(`${name}:import-zone-sans-capture`, JSON.stringify(mainHasCapture));
      }

      // Profil
      await page.goto(`${BASE}/demos/driveely/profil`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await page.waitForTimeout(1000);

      if (name === "desktop") {
        // Véhicule d'abord (avant de forcer un coût manuel via NumericInput)
        const brand = page.getByLabel(/Marque/i).first();
        const model = page.getByLabel(/Modèle/i).first();
        if ((await brand.count()) > 0 && (await model.count()) > 0) {
          // Re-sélectionner un véhicule pour reset costPerKmManual
          const vehicleBtn = page.getByRole("button", { name: /Voiture essence/i }).first();
          if ((await vehicleBtn.count()) > 0) await vehicleBtn.click();

          await brand.fill("Renault");
          await model.fill("Clio");
          const energy = page
            .locator("select")
            .filter({ hasText: /Essence|Diesel/i })
            .first();
          if ((await energy.count()) > 0) await energy.selectOption("essence");

          const conso = page.getByLabel(/Conso/i).first();
          await conso.waitFor({ state: "visible" });
          await conso.click({ clickCount: 3 });
          await page.keyboard.press("Backspace");
          await conso.type("7");
          await conso.blur();

          const price = page.getByLabel(/Prix €\/L/i).first();
          if ((await price.count()) > 0) {
            await price.click({ clickCount: 3 });
            await page.keyboard.press("Backspace");
            await price.type("1.8");
            await price.blur();
          }

          await page.waitForTimeout(400);
          const costField = page.getByLabel("Coût / km", { exact: false }).first();
          const costVal = await costField.inputValue();
          const n = Number(costVal.replace(",", "."));
          const estimate = await page
            .locator("text=/Estimation calculée/i")
            .innerText()
            .catch(() => "");
          if (Number.isFinite(n) && n > 0 && n < 2) {
            pass("profil:cout-km-auto", `${costVal} — ${estimate}`);
          } else {
            fail("profil:cout-km-auto", `${costVal} — ${estimate}`);
          }
          pass("profil:vehicule-champs");
        } else {
          fail("profil:vehicule-champs", "marque/modèle introuvables");
        }

        // Prénom requis pour sauvegarder
        const firstName = page.getByLabel(/Prénom/i).first();
        if ((await firstName.count()) > 0) {
          await firstName.fill("QA");
        }

        await testNumericField(page, "Coût / km", "0.35", "0.35");
        await testNumericField(page, "Objectif €/h", "22", "22");
        await testNumericField(page, "Objectif / jour", "150", "150");
        await testNumericField(page, "Bénéfice min. (€)", "8.5", "8.5");
        await testNumericField(page, "Distance max. (km)", "12", "12");

        // Sauvegarde profil
        const save = page.getByRole("button", { name: /Enregistrer/i }).first();
        await save.click();
        await page
          .getByText(/Profil enregistré|Impossible|requis/i)
          .first()
          .waitFor({ timeout: 15000 })
          .catch(() => {});
        const toastOk = await page
          .getByText(/Profil enregistré/i)
          .isVisible()
          .catch(() => false);
        if (!toastOk) {
          fail("profil:save-reload", "pas de toast succès");
        } else {
          await page.reload({ waitUntil: "domcontentloaded" });
          await page.waitForTimeout(1000);
          const hourly = page.getByLabel("Objectif €/h", { exact: false }).first();
          const v = await hourly.inputValue();
          if (v === "22") pass("profil:save-reload", v);
          else fail("profil:save-reload", `attendu 22, got ${v}`);
        }
      }

      await page.close();
    }
  } finally {
    await browser.close();
    if (userId) await deleteUser(userId);
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} OK`);
  if (failed.length) {
    console.log("Échecs:", failed.map((f) => f.id).join(", "));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
