import { NextResponse } from "next/server";
import type { PriorityListSubmission } from "@/lib/priority-list";
import { syncWaitlistToNotion } from "@/lib/notion-waitlist";
import { insertWaitlistEntry } from "@/lib/supabase";
import type { WaitlistEntry } from "@/lib/waitlist-types";

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

function toWaitlistEntry(submission: PriorityListSubmission): WaitlistEntry {
  return {
    email: submission.email,
    name: submission.name,
    company: submission.company,
    website: submission.website,
    need: submission.need,
    source: "priority_list",
  };
}

export async function POST(request: Request) {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch (parseErr) {
    console.error("[priority-list] JSON invalide:", parseErr);
    return NextResponse.json(
      { ok: false, message: "Corps de requête invalide." },
      { status: 400 },
    );
  }

  console.info("[priority-list] body reçu:", JSON.stringify(rawBody));

  const submission = parseBody(rawBody);

  if (!submission) {
    console.warn("[priority-list] validation échouée:", JSON.stringify(rawBody));
    return NextResponse.json(
      { ok: false, message: "Veuillez remplir tous les champs obligatoires." },
      { status: 400 },
    );
  }

  const entry = toWaitlistEntry(submission);
  console.info("[priority-list] entry:", JSON.stringify(entry));

  const supabaseResult = await insertWaitlistEntry(entry);
  console.info("[priority-list] Supabase:", JSON.stringify(supabaseResult));

  if (!supabaseResult.ok) {
    return NextResponse.json(
      { ok: false, message: supabaseResult.message, hint: supabaseResult.hint },
      { status: 500 },
    );
  }

  try {
    const notionResult = await syncWaitlistToNotion(entry);
    console.info("[priority-list] Notion:", JSON.stringify(notionResult));

    if (!notionResult.ok && !("skipped" in notionResult)) {
      console.warn(
        "[priority-list] Notion échec (inscription Supabase OK):",
        notionResult.message,
      );
    }
  } catch (notionErr) {
    console.error("[priority-list] Notion exception (Supabase OK):", notionErr);
  }

  return NextResponse.json({
    ok: true,
    message:
      "Merci pour votre intérêt. Votre demande a bien été enregistrée dans la liste prioritaire.",
  });
}
