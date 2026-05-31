import { NextResponse } from "next/server";
import type { PriorityListSubmission } from "@/lib/priority-list";
import { insertWaitlistEmail } from "@/lib/supabase";

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

    const result = await insertWaitlistEmail(submission.email);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: 500 },
      );
    }

    console.info("[priority-list] Inscription waitlist:", submission.email, {
      name: submission.name,
      company: submission.company,
    });

    return NextResponse.json({
      ok: true,
      message:
        "Merci pour votre intérêt. Votre demande a bien été enregistrée dans la liste prioritaire.",
    });
  } catch (err) {
    console.error("[priority-list]", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : "Une erreur est survenue. Réessayez dans un instant.",
      },
      { status: 500 },
    );
  }
}
