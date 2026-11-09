/**
 * Analyse SANS OCR — doit soit réussir Vision, soit renvoyer VISION_* (jamais mock).
 * Usage: npx tsx scripts/test-driveely-no-ocr-vision.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

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
const ANON = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!;
const SERVICE = (process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY)!;
const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function main() {
  const email = `driveely-novision-${Date.now()}@test.local`;
  const password = "TestDriveely123!";

  const admin = createClient(SUPABASE_URL, SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !created.user) throw new Error(error?.message ?? "create");
  await admin.from("margeo_profiles").upsert({
    id: created.user.id,
    name: "NoOCR",
    city: "Lyon",
    vehicle: "velo",
    platforms: ["Uber Eats"],
    target_hourly: 16,
    daily_target: 90,
    cost_per_km: 0.05,
    onboarding_completed: true,
  });
  const client = createClient(SUPABASE_URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: s, error: se } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (se || !s.session) throw new Error(se?.message ?? "signin");
  const img = fs.readFileSync(
    path.join(__dirname, "fixtures/driveely-test-screenshot.png"),
  );
  const form = new FormData();
  form.append(
    "image",
    new Blob([new Uint8Array(img)], { type: "image/jpeg" }),
    "shot.jpg",
  );
  const res = await fetch(`${BASE}/api/driveely/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${s.session.access_token}`,
      "X-Driveely-Client": "e2e",
    },
    body: form,
  });
  const data = await res.json();
  console.log(
    JSON.stringify(
      {
        status: res.status,
        code: data.code,
        source: data.source,
        score: data.analysis?.score,
        error: data.error,
        retryAfter: res.headers.get("retry-after"),
      },
      null,
      2,
    ),
  );
  if (res.status === 200 && data.source === "mock") {
    console.error("✗ mock success after Vision failure — forbidden");
    process.exit(1);
  }
  if (res.status === 200 && data.analysis) {
    console.log("✓ real vision success");
    process.exit(0);
  }
  if (res.status === 503 && String(data.code || "").startsWith("VISION_")) {
    console.log("✓ clean Vision degradation (no fake score)");
    process.exit(0);
  }
  console.error("✗ unexpected outcome");
  process.exit(1);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
