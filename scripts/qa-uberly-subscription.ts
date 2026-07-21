/**
 * QA abonnement Uberly (activation simulée).
 * Usage: set -a && source .env.local && set +a && npx tsx scripts/qa-uberly-subscription.ts
 */
import { createClient } from "@supabase/supabase-js";

const APP =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";
const BASE = `${APP}/demos/uberly`;
const API = `${APP}/api/uberly`;

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SECRET_KEY!;

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];

function ok(name: string, detail?: string) {
  checks.push({ name, ok: true, detail });
  console.log(`✅ ${name}${detail ? ` — ${detail}` : ""}`);
}
function fail(name: string, detail?: string) {
  checks.push({ name, ok: false, detail });
  console.log(`❌ ${name}${detail ? ` — ${detail}` : ""}`);
}

async function main() {
  console.log(`\n=== QA Abonnement Uberly — ${APP} ===\n`);

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = `sub-qa-${Date.now()}@uberly.test`;
  const password = "TestUberly123!";

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "QA Sub", first_name: "QA", last_name: "Sub" },
  });
  if (created.error || !created.data.user) {
    fail("Création compte", created.error?.message);
    process.exit(1);
  }
  const userId = created.data.user.id;
  ok("Création compte", userId);

  await admin.from("margeo_profiles").upsert({
    id: userId,
    name: "QA Sub",
    first_name: "QA",
    last_name: "Sub",
    city: "Lyon",
    vehicle: "velo",
    cost_per_km: 0.1,
    target_hourly: 15,
    daily_target: 80,
    platforms: ["Uber Eats"],
    premium: false,
    onboarding_completed: true,
  });

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const login = await client.auth.signInWithPassword({ email, password });
  if (login.error || !login.data.session) {
    fail("Connexion", login.error?.message);
    process.exit(1);
  }
  ok("Connexion");
  const token = login.data.session.access_token;

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Cookie session for page routes is harder; we test API + DB.

  const getSub = async () => {
    const res = await fetch(`${API}/subscription`, { headers: authHeaders });
    const json = await res.json();
    return { res, json };
  };

  {
    const { res, json } = await getSub();
    if (res.ok && json.subscription?.planId === "discovery") {
      ok("GET abonnement Découverte");
    } else {
      fail("GET abonnement Découverte", `${res.status} ${JSON.stringify(json)}`);
    }
  }

  {
    const res = await fetch(`${API}/subscription/activate`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ planId: "pro" }),
    });
    const json = await res.json();
    if (res.ok && json.subscription?.planId === "pro") {
      ok("Activation Pro (simulée)");
    } else {
      fail("Activation Pro", `${res.status} ${JSON.stringify(json)}`);
    }
  }

  {
    const { res, json } = await getSub();
    if (
      res.ok &&
      json.entitlements?.canUnlimitedAnalysis === true &&
      json.entitlements?.canExportCSV === false
    ) {
      ok("Entitlements Pro");
    } else {
      fail("Entitlements Pro", JSON.stringify(json.entitlements));
    }
  }

  {
    const res = await fetch(`${API}/export/csv`, { headers: authHeaders });
    if (res.status === 403) ok("Export CSV bloqué sur Pro (403)");
    else fail("Export CSV devrait être 403", String(res.status));
  }

  {
    const res = await fetch(`${API}/subscription/change`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ planId: "elite" }),
    });
    const json = await res.json();
    if (res.ok && json.subscription?.planId === "elite") {
      ok("Upgrade Elite");
    } else {
      fail("Upgrade Elite", `${res.status} ${JSON.stringify(json)}`);
    }
  }

  {
    const res = await fetch(`${API}/export/csv`, { headers: authHeaders });
    if (res.ok) ok("Export CSV autorisé Elite");
    else fail("Export CSV Elite", String(res.status));
  }

  {
    const res = await fetch(`${API}/subscription/change`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ planId: "pro" }),
    });
    const json = await res.json();
    if (res.ok && json.subscription?.planId === "pro") {
      ok("Downgrade Pro");
    } else {
      fail("Downgrade Pro", `${res.status} ${JSON.stringify(json)}`);
    }
  }

  {
    const res = await fetch(`${API}/subscription/cancel?immediate=1`, {
      method: "POST",
      headers: authHeaders,
      body: "{}",
    });
    const json = await res.json();
    if (res.ok && json.subscription?.planId === "discovery") {
      ok("Annulation immédiate → Découverte");
    } else {
      fail("Annulation", `${res.status} ${JSON.stringify(json)}`);
    }
  }

  {
    const res = await fetch(`${API}/subscription/history`, {
      headers: authHeaders,
    });
    const json = await res.json();
    if (res.ok && Array.isArray(json.history) && json.history.length >= 1) {
      ok("Historique événements", `${json.history.length} events`);
    } else {
      fail("Historique", `${res.status} len=${json.history?.length}`);
    }
  }

  // Persistance via API (source de vérité runtime)
  {
    const { res, json } = await getSub();
    if (res.ok && json.subscription?.planId === "discovery") {
      ok("Persistance abonnement Découverte");
    } else {
      fail("Persistance abonnement", JSON.stringify(json?.subscription));
    }
  }

  // Miroir profil si disponible
  {
    const { data } = await admin
      .from("margeo_profiles")
      .select("premium")
      .eq("id", userId)
      .maybeSingle();
    if (!data) {
      ok("Profil optionnel absent (ensureProfile au login UI)");
    } else if (data.premium === false) {
      ok("Persistance profil Découverte");
    } else {
      fail("Persistance profil", JSON.stringify(data));
    }
  }

  // Cleanup
  await admin.auth.admin.deleteUser(userId);

  const passed = checks.filter((c) => c.ok).length;
  console.log(`\n========== ${passed}/${checks.length} OK ==========\n`);
  process.exit(passed === checks.length ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
