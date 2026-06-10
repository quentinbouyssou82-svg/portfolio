import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { WaitlistEntry } from "@/lib/waitlist-types";
import {
  buildWaitlistRow,
  buildWaitlistUpdateRow,
  logWaitlistRow,
  type WaitlistRow,
} from "@/lib/waitlist-row";

type SupabaseConfig =
  | { ok: true; url: string; key: string; role: "service_role" | "anon" }
  | { ok: false; error: string };

function resolveSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anonKey = process.env.SUPABASE_ANON_KEY?.trim();
  const key = serviceKey || anonKey;

  if (!url || !key) {
    return {
      ok: false,
      error:
        "Variables manquantes : SUPABASE_URL et SUPABASE_ANON_KEY (ou SUPABASE_SERVICE_ROLE_KEY) dans .env.local / Vercel.",
    };
  }

  if (!url.includes("supabase.co")) {
    return {
      ok: false,
      error: `SUPABASE_URL invalide : "${url}". Utilise l'URL …supabase.co du dashboard.`,
    };
  }

  return {
    ok: true,
    url,
    key,
    role: serviceKey ? "service_role" : "anon",
  };
}

let client: SupabaseClient | null = null;
let clientRole: "service_role" | "anon" | null = null;

function getSupabase(): SupabaseClient {
  const config = resolveSupabaseConfig();
  if (!config.ok) {
    throw new Error(config.error);
  }

  if (!client || clientRole !== config.role) {
    client = createClient(config.url, config.key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    clientRole = config.role;
    console.info("[supabase] client initialisé", { role: config.role });
  }

  return client;
}

export type WaitlistInsertResult =
  | { ok: true; row?: WaitlistRow; action?: "insert" | "update" }
  | { ok: false; message: string; code?: string; hint?: string };

function mapSupabaseError(error: {
  code?: string;
  message?: string;
  hint?: string | null;
}): WaitlistInsertResult {
  if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
    return {
      ok: false,
      code: error.code,
      hint: "table",
      message:
        "Table waitlist introuvable. Exécute supabase/waitlist-setup.sql dans Supabase → SQL Editor.",
    };
  }

  if (
    error.code === "PGRST204" ||
    error.message?.includes("Could not find") ||
    error.message?.includes("column")
  ) {
    return {
      ok: false,
      code: error.code,
      hint: "columns",
      message:
        "Colonnes manquantes. Exécute supabase/waitlist-migrate.sql dans Supabase → SQL Editor.",
    };
  }

  if (error.code === "42501" || error.message?.toLowerCase().includes("row-level security")) {
    return {
      ok: false,
      code: error.code,
      hint: "RLS",
      message:
        "Accès Supabase refusé (RLS). Ajoute SUPABASE_SERVICE_ROLE_KEY sur Vercel, ou exécute supabase/waitlist-rls.sql.",
    };
  }

  const devDetail =
    process.env.NODE_ENV === "development"
      ? ` (${error.code ?? "?"}: ${error.message})`
      : "";

  return {
    ok: false,
    code: error.code,
    hint: error.hint ?? undefined,
    message: `Impossible d'enregistrer votre demande.${devDetail}`,
  };
}

export async function insertWaitlistEntry(
  entry: WaitlistEntry,
): Promise<WaitlistInsertResult> {
  const config = resolveSupabaseConfig();
  if (!config.ok) {
    console.error("[supabase] config:", config.error);
    return { ok: false, message: config.error, hint: "env" };
  }

  const row = buildWaitlistRow(entry);
  const updateRow = buildWaitlistUpdateRow(entry);
  logWaitlistRow("INSERT row", row);
  logWaitlistRow("UPDATE row (si email existant)", updateRow);

  try {
    const db = getSupabase();

    const { data: inserted, error: insertError } = await db
      .from("waitlist")
      .insert([row])
      .select()
      .single();

    if (!insertError) {
      console.info("[supabase] insert OK", { email: row.email, data: inserted });
      return { ok: true, row, action: "insert" };
    }

    if (insertError.code !== "23505") {
      console.error("[supabase] insert failed:", {
        role: config.role,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        row,
      });
      return mapSupabaseError(insertError);
    }

    console.info("[supabase] email déjà présent, update", { email: row.email });

    const { data: updated, error: updateError } = await db
      .from("waitlist")
      .update(updateRow)
      .eq("email", row.email)
      .select()
      .single();

    if (!updateError) {
      console.info("[supabase] update OK", { email: row.email, data: updated });
      return { ok: true, row, action: "update" };
    }

    console.error("[supabase] update failed:", {
      role: config.role,
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
      updateRow,
    });

    return mapSupabaseError(updateError);
  } catch (err) {
    console.error("[supabase] unexpected:", err);

    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("ENOTFOUND") || message.includes("fetch failed")) {
      return {
        ok: false,
        message:
          "Connexion Supabase impossible. Vérifie SUPABASE_URL, puis redémarre le serveur.",
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

export async function insertWaitlistEmail(email: string): Promise<WaitlistInsertResult> {
  return insertWaitlistEntry({
    email,
    source: "waitlist_email",
  });
}
