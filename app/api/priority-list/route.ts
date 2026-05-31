import { NextResponse } from "next/server";
import type { PriorityListSubmission } from "@/lib/priority-list";

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

    /**
     * Intégrations futures :
     *
     * Notion — créer une page dans une base via l'API Notion :
     *   process.env.NOTION_TOKEN, process.env.NOTION_DATABASE_ID
     *
     * Tally — webhook ou redirect POST vers l'URL du formulaire Tally :
     *   process.env.TALLY_WEBHOOK_URL
     */
    if (process.env.NODE_ENV === "development") {
      console.info("[priority-list] Nouvelle inscription:", submission);
    }

    // Exemple Notion (à décommenter et configurer) :
    // await fetch("https://api.notion.com/v1/pages", { ... })

    // Exemple Tally webhook (à décommenter et configurer) :
    // await fetch(process.env.TALLY_WEBHOOK_URL!, { method: "POST", body: JSON.stringify(submission) })

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
