import { NextResponse } from "next/server";
import { getMaisonConfigStatus, getMaisonSupabaseUrl } from "@/lib/maison/env";
import { getMaisonDb } from "@/lib/maison/supabase/server";

export async function GET() {
  const { configured, missing } = getMaisonConfigStatus();
  const url = getMaisonSupabaseUrl();

  if (!configured) {
    return NextResponse.json({ ok: false, missing, url }, { status: 503 });
  }

  try {
    const { error } = await getMaisonDb()
      .from("households")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json({
        ok: false,
        url,
        error: error.message,
        hint:
          error.message.includes("does not exist") || error.code === "42P01"
            ? "Exécute supabase/maison-setup.sql dans SQL Editor"
            : undefined,
      });
    }

    return NextResponse.json({ ok: true, url, message: "Supabase connecté" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return NextResponse.json({
      ok: false,
      url,
      error: message,
      hint:
        message.includes("fetch failed") || message.includes("ENOTFOUND")
          ? "SUPABASE_URL incorrect ou projet inexistant — copie l’URL depuis Supabase → Connect"
          : undefined,
    });
  }
}
