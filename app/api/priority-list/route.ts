import { NextResponse } from "next/server";
import type { PriorityListSubmission } from "@/lib/priority-list";
import { supabase } from "@/lib/supabase";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseBody(body: unknown): PriorityListSubmission | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const company = typeof data.company === "string" ? data.company.trim() : "";
  const website =
    typeof data.website === "string" && data.website.trim()
      ? data.website.trim()
      : undefined;
  const need = typeof data.need === "string" ? data.need.trim() : "";

  if (!name || !email || !company || !need) return null;
  if (!isValidEmail(email)) return null;

  return { name, email, company, website, need };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const submission = parseBody(body);

    if (!submission) {
      return NextResponse.json(
        { ok: false, message: "Veuillez remplir tous les champs obligatoires." },
        { status: 400 },
      );
    }

    const { error: dbError } = await supabase
      .from("waitlist")
      .insert([{ email: submission.email }]);

    if (dbError) {
      console.error("[priority-list] Supabase:", dbError);
      return NextResponse.json(
        { ok: false, message: "Impossible d'enregistrer votre demande. Réessayez plus tard." },
        { status: 500 },
      );
    }

    console.info("[priority-list] Inscription waitlist:", submission.email);

    return NextResponse.json({
      ok: true,
      message:
        "Merci pour votre intérêt. Votre demande a bien été enregistrée dans la liste prioritaire.",
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Une erreur est survenue. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
