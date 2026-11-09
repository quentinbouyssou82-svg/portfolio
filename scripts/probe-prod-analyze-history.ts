/**
 * Prod E2E probe: analyze (OCR path) → list history via Supabase REST → verify ID present.
 * Never prints tokens / secrets / PII addresses.
 */
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function loadEnvLocal(): Record<string, string> {
  const env: Record<string, string> = {};
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const eq = trimmed.indexOf("=");
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

async function mintAccessToken(
  url: string,
  serviceKey: string,
  publishableKey: string,
  userId: string,
): Promise<string> {
  const admin = createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } =
    await admin.auth.admin.getUserById(userId);
  if (userErr || !userData.user?.email) {
    throw new Error(`User lookup failed: ${userErr?.message ?? "no email"}`);
  }
  const email = userData.user.email;

  const { data: linkData, error: linkErr } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
  if (linkErr || !linkData.properties) {
    throw new Error(`generateLink failed: ${linkErr?.message ?? "no props"}`);
  }

  const props = linkData.properties as {
    hashed_token?: string;
  };

  const anon = createSupabaseClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (!props.hashed_token) {
    throw new Error("No hashed_token from generateLink");
  }
  const r = await anon.auth.verifyOtp({
    token_hash: props.hashed_token,
    type: "magiclink",
  });
  const token = r.data.session?.access_token;
  if (!token) {
    throw new Error(`verifyOtp failed: ${r.error?.message ?? "no session"}`);
  }
  return token;
}

async function main() {
  const env = loadEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SECRET_KEY;
  const publishable =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  const apiBase = "https://www.driveely.app";
  const userId =
    process.env.PROBE_USER_ID || "2093e6b5-5f4d-417a-9abb-bd692bc2d439";
  const runs = Math.max(1, Number(process.env.PROBE_RUNS || "2"));

  if (!url || !serviceKey || !publishable) {
    throw new Error("Missing Supabase credentials in .env.local");
  }

  const accessToken = await mintAccessToken(
    url,
    serviceKey,
    publishable,
    userId,
  );

  const results: Array<Record<string, unknown>> = [];

  for (let i = 0; i < runs; i++) {
    const chalRes = await fetch(`${apiBase}/api/driveely/ocr/challenge`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Driveely-Client": "ios",
      },
      body: "{}",
    });
    const chalJson = (await chalRes.json()) as {
      challenge?: string;
      error?: string;
    };
    if (!chalRes.ok || !chalJson.challenge) {
      throw new Error(
        `ocr/challenge ${chalRes.status}: ${chalJson.error ?? "no challenge"}`,
      );
    }

    const image = Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]),
      Buffer.alloc(12_000, 0x01 + i),
      Buffer.from([0xff, 0xd9]),
    ]);

    const ocrPayload = JSON.stringify({
      platform: "Uber Eats",
      price_eur: 8.4 + i * 0.1,
      distance_km: 3.2,
      duration_min: 18,
      pickup_address: "Probe Pickup",
      dropoff_address: "Probe Dropoff",
      stops_count: 1,
      confidence: 92,
    });
    const imageSha = sha256Hex(image);
    const binding = sha256Hex(
      `${chalJson.challenge}\n${imageSha}\n${ocrPayload}`,
    );

    const boundary = `----DriveelyHistBound${i}`;
    const chunks: Buffer[] = [];
    const add = (s: string | Buffer) =>
      chunks.push(typeof s === "string" ? Buffer.from(s) : s);
    add(
      `--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="capture.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`,
    );
    add(image);
    add(
      `\r\n--${boundary}\r\nContent-Disposition: form-data; name="ocrPayload"\r\n\r\n${ocrPayload}\r\n`,
    );
    add(
      `--${boundary}\r\nContent-Disposition: form-data; name="source"\r\n\r\non_device_ocr\r\n`,
    );
    add(
      `--${boundary}\r\nContent-Disposition: form-data; name="ocrChallenge"\r\n\r\n${chalJson.challenge}\r\n`,
    );
    add(
      `--${boundary}\r\nContent-Disposition: form-data; name="ocrBinding"\r\n\r\n${binding}\r\n`,
    );
    add(`--${boundary}--\r\n`);
    const body = Buffer.concat(chunks);

    const started = Date.now();
    const analyzeRes = await fetch(`${apiBase}/api/driveely/analyze`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
        "X-Driveely-Client": "ios",
      },
      body,
    });
    const analyzeJson = (await analyzeRes.json()) as {
      analysis?: { id?: string; score?: number; verdict?: string };
      source?: string;
      code?: string;
      error?: string;
    };
    const analyzeMs = Date.now() - started;
    const analysisId = analyzeJson.analysis?.id;

    if (!analyzeRes.ok || !analysisId) {
      results.push({
        run: i + 1,
        ok: false,
        status: analyzeRes.status,
        code: analyzeJson.code,
        ms: analyzeMs,
      });
      continue;
    }

    // Same path as iOS history: user JWT + RLS on margeo_analyses join rides.
    const histRes = await fetch(
      `${url}/rest/v1/margeo_analyses?select=id,score,verdict,analyzed_at,ride:margeo_rides(id,platform,payout)&user_id=eq.${userId}&id=eq.${analysisId}`,
      {
        headers: {
          apikey: publishable,
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const histRows = (await histRes.json()) as Array<{
      id?: string;
      ride?: { id?: string } | null;
    }>;
    const found = Array.isArray(histRows) && histRows.some((r) => r.id === analysisId);
    const rideOk =
      found && histRows.some((r) => r.id === analysisId && r.ride?.id);

    results.push({
      run: i + 1,
      ok: found && Boolean(rideOk),
      status: analyzeRes.status,
      analyzeMs,
      analysisIdPrefix: analysisId.slice(0, 8),
      source: analyzeJson.source,
      score: analyzeJson.analysis?.score,
      verdict: analyzeJson.analysis?.verdict,
      historyStatus: histRes.status,
      foundInHistory: found,
      rideJoined: Boolean(rideOk),
    });
  }

  console.log(JSON.stringify({ runs, results }, null, 2));
  if (results.some((r) => !r.ok)) process.exit(1);
}

main().catch((e) => {
  console.error("PROBE_FAILED", e instanceof Error ? e.message : e);
  process.exit(1);
});
