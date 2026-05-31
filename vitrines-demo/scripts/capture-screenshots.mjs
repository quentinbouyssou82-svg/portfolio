import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const pages = [
  { slug: "bella-vista", file: "bella-vista.png" },
  { slug: "titan-fitness", file: "titan-fitness.png" },
  { slug: "nova-habitat", file: "nova-habitat.png" },
];

const outDir = path.resolve(import.meta.dirname, "../../public/projects");
const baseUrl = "http://127.0.0.1:3001";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

for (const pageInfo of pages) {
  const page = await context.newPage();
  await page.goto(`${baseUrl}/${pageInfo.slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(outDir, pageInfo.file),
    fullPage: false,
  });
  await page.close();
  console.log(`Captured ${pageInfo.file}`);
}

await browser.close();
