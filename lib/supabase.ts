import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return {
      error:
        "Variables manquantes : SUPABASE_URL et SUPABASE_ANON_KEY dans .env.local (puis redémarrer npm run dev).",
    };
  }

  if (!url.includes("supabase.co")) {
    return {
      error: `SUPABASE_URL invalide : "${url}". Utilise l'URL du dashboard (…supabase.co, pas .com).`,
    };
  }

  return { url, anonKey };
}

let client: SupabaseClient | null = null;

export function getSupabase() {
  const config = getSupabaseConfig();
  if ("error" in config) {
    throw new Error(config.error);
  }

  if (!client) {
    client = createClient(config.url, config.anonKey);
  }

  return client;
}

export type WaitlistInsertResult =
  | { ok: true }
  | { ok: false; message: string; code?: string; hint?: string };

export async function insertWaitlistEmail(email: string): Promise<WaitlistInsertResult> {
  const normalized = email.trim().toLowerCase();

  try {
    const db = getSupabase();
    const { error } = await db.from("waitlist").insert([{ email: normalized }]);

    if (!error) {
      return { ok: true };
    }

    console.error("[supabase] insert waitlist failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });

    // RLS — le cas le plus fréquent en dev
    if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
      return {
        ok: false,
        code: error.code,
        hint: "table",
        message:
          "Table waitlist introuvable. Exécute supabase/waitlist-setup.sql dans Supabase → SQL Editor.",
      };
    }

    if (error.code === "42501" || error.message?.toLowerCase().includes("row-level security")) {
      return {
        ok: false,
        code: error.code,
        hint: "RLS",
        message:
          "Accès refusé (RLS). Dans Supabase : table waitlist → désactiver RLS (dev) ou exécuter supabase/waitlist-rls.sql",
      };
    }

    if (error.code === "23505") {
      return { ok: true };
    }

    const devDetail =
      process.env.NODE_ENV === "development"
        ? ` (${error.code ?? "erreur"}: ${error.message})`
        : "";

    return {
      ok: false,
      code: error.code,
      hint: error.hint ?? undefined,
      message: `Impossible d'enregistrer votre demande.${devDetail}`,
    };
  } catch (err) {
    console.error("[supabase] unexpected:", err);

    const message =
      err instanceof Error ? err.message : "Erreur de connexion Supabase.";

    if (message.includes("ENOTFOUND") || message.includes("fetch failed")) {
      return {
        ok: false,
        message:
          "Connexion Supabase impossible. Vérifie SUPABASE_URL dans .env.local (Project Settings → API), puis rm -rf .next && npm run dev.",
      };
    }

    return {
      ok: false,
      message:
        process.env.NODE_ENV === "development"
          ? message
          : "Impossible d'enregistrer votre demande. Réessayez plus tard.",
    };
  }
}
