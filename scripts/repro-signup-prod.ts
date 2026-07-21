import { chromium } from "playwright";

const email = process.argv[2] || `uberly.repro.${Date.now()}@gmail.com`;
const password = "TestUberly123!";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("response", async (res) => {
    if (res.request().method() === "POST" && res.url().includes("login")) {
      console.log("POST", res.status(), res.url());
    }
  });
  await page.goto("https://margeo.vercel.app/demos/uberly/login?mode=signup");
  await page.getByLabel("Prénom").fill("Repro");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /Créer mon compte/i }).click();
  await page.waitForTimeout(8000);
  console.log("URL:", page.url());
  const toasts = await page.locator("[data-sonner-toast]").allTextContents();
  console.log("TOAST:", toasts);
  const cookies = await page.context().cookies();
  console.log("AUTH COOKIE:", cookies.some((c) => c.name.includes("auth-token")));
  await browser.close();
})();
