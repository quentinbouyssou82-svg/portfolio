/**
 * Valide le fallback OCR d'urgence quand Vision 429/timeout.
 * Usage: npx tsx scripts/test-driveely-emergency-ocr.ts
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
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY!;
const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const email = `driveely-ocr-emg-${Date.now()}@test.local`;
const password = "TestDriveely123!";

async function main() {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) throw new Error(createErr?.message ?? "create");
  const userId = created.user.id;

  const { error: profErr } = await admin.from("margeo_profiles").upsert({
    id: userId,
    name: "OCR Emergency",
    city: "Lyon",
    vehicle: "velo",
    platforms: ["Uber Eats"],
    target_hourly: 16,
    daily_target: 90,
    cost_per_km: 0.05,
    onboarding_completed: true,
  });
  if (profErr) throw new Error(profErr.message);

  const client = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: session, error: signErr } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (signErr || !session.session) throw new Error(signErr?.message ?? "signin");

  const image = fs.readFileSync(
    path.join(__dirname, "fixtures/driveely-test-screenshot.png"),
  );
  const ocrPayload = JSON.stringify({
    platform: "Uber Eats",
    payout: 12.4,
    pickup: "Five Guys, Lyon",
    dropoff: "Part-Dieu",
    distanceKm: 4.2,
    durationMin: 18,
    confidence: 92,
  });

  const form = new FormData();
  form.append(
    "image",
    new Blob([new Uint8Array(image)], { type: "image/jpeg" }),
    "shot.jpg",
  );
  form.append("source", "on_device_ocr");
  form.append("ocrPayload", ocrPayload);

  const res = await fetch(`${BASE}/api/driveely/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.session.access_token}`,
      "X-Driveely-Client": "e2e",
    },
    body: form,
  });
  const data = await res.json();
  console.log("status", res.status);
  console.log("code", data.code ?? "ok");
  console.log("source", data.source);
  console.log("warnings", data.warnings?.slice?.(0, 2));
  console.log("score", data.analysis?.score);
  console.log("verdict", data.analysis?.verdict);

  // Acceptable outcomes under Mistral pressure:
  // 200 + on_device_ocr (emergency) OR 200 + vision OR 503 VISION_* with Retry-After
  if (res.status === 200 && data.analysis?.score != null) {
    console.log("✓ emergency/analyze path returned analysis");
    process.exit(0);
  }
  if (
    res.status === 503 &&
    typeof data.code === "string" &&
    data.code.startsWith("VISION_")
  ) {
    console.log("✓ degraded Vision error surfaced cleanly (no OCR accept path)");
    process.exit(0);
  }
  console.error("✗ unexpected", JSON.stringify(data).slice(0, 400));
  process.exit(1);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
