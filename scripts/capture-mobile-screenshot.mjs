import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const url = process.argv[2] ?? "http://localhost:3000/demos/titan-fitness";
const out = process.argv[3] ?? "public/projects/titan-fitness-mobile.png";
const scale = Number(process.argv[4] ?? 4);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: scale,
});

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);

await mkdir(path.dirname(out), { recursive: true });
await page.screenshot({ path: out, fullPage: false, type: "png" });

await browser.close();
console.log(`Saved ${out}`);
