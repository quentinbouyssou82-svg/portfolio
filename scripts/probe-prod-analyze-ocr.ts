/**
 * Authenticated prod probe for /api/driveely/analyze using OCR payload.
 * Avoids Mistral when OCR skip/fallback is active. Never prints secrets.
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
    email_otp?: string;
    action_link?: string;
  };

  const anon = createSupabaseClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const attempts: Array<() => Promise<string | null>> = [
    async () => {
      if (!props.hashed_token) return null;
      const r = await anon.auth.verifyOtp({
        token_hash: props.hashed_token,
        type: "magiclink",
      });
      return r.data.session?.access_token ?? null;
    },
    async () => {
      if (!props.hashed_token) return null;
      const r = await anon.auth.verifyOtp({
        token_hash: props.hashed_token,
        type: "email",
      });
      return r.data.session?.access_token ?? null;
    },
    async () => {
      if (!props.email_otp) return null;
      const r = await anon.auth.verifyOtp({
        email,
        token: props.email_otp,
        type: "magiclink",
      });
      return r.data.session?.access_token ?? null;
    },
    async () => {
      if (!props.action_link) return null;
      const action = new URL(props.action_link);
      const token =
        action.searchParams.get("token") ??
        action.searchParams.get("token_hash");
      if (!token) return null;
      const r = await anon.auth.verifyOtp({
        email,
        token,
        type: "magiclink",
      });
      return r.data.session?.access_token ?? null;
    },
    async () => {
      // Direct GoTrue verify with service role as Authorization still needs anon for user session.
      if (!props.hashed_token) return null;
      const res = await fetch(`${url}/auth/v1/verify`, {
        method: "POST",
        headers: {
          apikey: publishableKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "magiclink",
          token_hash: props.hashed_token,
        }),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as {
        access_token?: string;
      };
      return json.access_token ?? null;
    },
  ];

  for (const attempt of attempts) {
    try {
      const token = await attempt();
      if (token) return token;
    } catch {
      // try next
    }
  }
  throw new Error("Unable to mint access token for probe user");
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

  if (!url || !serviceKey || !publishable) {
    throw new Error("Missing Supabase credentials in .env.local");
  }

  const accessToken = await mintAccessToken(
    url,
    serviceKey,
    publishable,
    userId,
  );

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

  // Prepared-looking JPEG (SOI + >=4KB) — matches iOS CapturePreprocessor path.
  const image = Buffer.concat([
    Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]),
    Buffer.alloc(12_000, 0x01),
    Buffer.from([0xff, 0xd9]),
  ]);

  const ocrPayload = JSON.stringify({
    platform: "Uber Eats",
    price_eur: 8.4,
    distance_km: 3.2,
    duration_min: 18,
    pickup_address: "Five Guys, Confluence",
    dropoff_address: "Sainte-Foy-lès-Lyon",
    stops_count: 1,
    confidence: 92,
  });
  const imageSha = sha256Hex(image);
  const binding = sha256Hex(
    `${chalJson.challenge}\n${imageSha}\n${ocrPayload}`,
  );

  const boundary = "----DriveelyProbeBound";
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
  const text = await analyzeRes.text();
  const ms = Date.now() - started;
  let summary: Record<string, unknown> = { status: analyzeRes.status, ms };
  try {
    const json = JSON.parse(text) as Record<string, unknown>;
    if (json.analysis && typeof json.analysis === "object") {
      const a = json.analysis as Record<string, unknown>;
      summary = {
        status: analyzeRes.status,
        ms,
        score: a.score,
        verdict: a.verdict,
        source: json.source,
        warnings: json.warnings,
        timings: json.timings,
      };
    } else {
      summary = {
        status: analyzeRes.status,
        ms,
        code: json.code,
        error: json.error,
        body: text.slice(0, 300),
      };
    }
  } catch {
    summary = { status: analyzeRes.status, ms, body: text.slice(0, 300) };
  }
  console.log(JSON.stringify(summary, null, 2));
  if (analyzeRes.status >= 400) process.exit(1);
}

main().catch((e) => {
  console.error("PROBE_FAILED", e instanceof Error ? e.message : e);
  process.exit(1);
});
