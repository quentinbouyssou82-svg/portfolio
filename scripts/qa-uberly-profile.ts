/**
 * Smoke test profil + logout Uberly (bêta).
 * Usage: npx tsx scripts/qa-uberly-profile.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i);
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SECRET = process.env.SUPABASE_SECRET_KEY!;
const APP =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const email = `profile-qa-${Date.now()}@uberly-test.local`;
const password = "TestUberly123!";

function ok(label: string, detail?: unknown) {
  console.log(`PASS  ${label}${detail != null ? ` — ${detail}` : ""}`);
}
function fail(label: string, detail?: unknown): never {
  console.error(`FAIL  ${label}${detail != null ? ` — ${detail}` : ""}`);
  process.exit(1);
}

async function createUser() {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "QA" },
    }),
  });
  const data = await res.json();
  if (!res.ok) fail("create user", JSON.stringify(data).slice(0, 200));
  return data.id as string;
}

async function login() {
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: PUB,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );
  const data = await res.json();
  if (!res.ok) fail("login", JSON.stringify(data).slice(0, 200));
  return data as { access_token: string; refresh_token: string; user: { id: string } };
}

async function updateMeta(
  userId: string,
  meta: Record<string, string>,
) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_metadata: meta }),
  });
  if (!res.ok) fail("update metadata", await res.text());
}

async function updateName(userId: string, name: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/margeo_profiles?id=eq.${userId}`,
    {
      method: "PATCH",
      headers: {
        apikey: SECRET,
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ name }),
    },
  );
  const data = await res.json();
  if (!res.ok) fail("update profile name", JSON.stringify(data).slice(0, 200));
  return data[0];
}

async function getUser(userId: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
  });
  const data = await res.json();
  if (!res.ok) fail("get user", JSON.stringify(data).slice(0, 200));
  return data;
}

async function uploadAvatar(userId: string) {
  // 1x1 png
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const path = `${userId}/avatar.png`;
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/uberly-avatars/${path}`,
    {
      method: "POST",
      headers: {
        apikey: SECRET,
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "image/png",
        "x-upsert": "true",
      },
      body: png,
    },
  );
  if (!res.ok && res.status !== 200) {
    fail("avatar upload", `${res.status} ${await res.text()}`);
  }
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/uberly-avatars/${path}`;
  return publicUrl;
}

async function logout(accessToken: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
    method: "POST",
    headers: {
      apikey: PUB,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok && res.status !== 204) {
    fail("logout", `${res.status} ${await res.text()}`);
  }
}

async function deleteUser(userId: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
  });
}

async function main() {
  console.log("QA Uberly profile @", APP);
  const userId = await createUser();
  ok("create user", userId);

  // Ensure profile row
  await fetch(`${SUPABASE_URL}/rest/v1/margeo_profiles`, {
    method: "POST",
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: userId,
      name: "QA",
      onboarding_completed: true,
    }),
  });
  ok("ensure profile row");

  const session = await login();
  ok("login");

  const display = "Karim Benali";
  await updateName(userId, display);
  ok("update display name", display);

  const avatarUrl = await uploadAvatar(userId);
  ok("upload avatar", avatarUrl);

  await updateMeta(userId, {
    first_name: "Karim",
    last_name: "Benali",
    avatar_url: avatarUrl,
    name: display,
  });
  ok("sync auth metadata");

  const user = await getUser(userId);
  const meta = user.user?.user_metadata ?? user.user_metadata ?? {};
  if (meta.first_name !== "Karim" || meta.last_name !== "Benali") {
    fail("persist first/last name", JSON.stringify(meta));
  }
  if (!meta.avatar_url?.includes("uberly-avatars")) {
    fail("persist avatar_url", meta.avatar_url);
  }
  ok("persistence first/last/avatar in Supabase");

  await logout(session.access_token);
  ok("logout");

  // Re-login and verify persistence
  const again = await login();
  ok("re-login");
  const user2 = await getUser(again.user.id);
  const meta2 = user2.user?.user_metadata ?? user2.user_metadata ?? {};
  if (meta2.first_name !== "Karim" || !meta2.avatar_url) {
    fail("persistence after re-login", JSON.stringify(meta2));
  }
  ok("persistence after re-login");

  await logout(again.access_token);
  await deleteUser(userId);
  ok("cleanup");

  console.log("\nAll profile QA checks passed.");
  console.log(
    "NOTE: run supabase/uberly-profile-v1.sql to add first_name/last_name/avatar_url columns on margeo_profiles.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
