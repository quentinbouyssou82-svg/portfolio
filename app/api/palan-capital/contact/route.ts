import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/palan-capital/constants";

type ContactBody = {
  nom?: string;
  email?: string;
  societe?: string;
  sujet?: string;
  message?: string;
  rgpd?: string;
};

export async function POST(request: Request) {
  let body: ContactBody;

  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { nom, email, societe, sujet, message } = body;

  if (!nom?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Nom et email sont requis." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  const recipient = process.env.PALAN_CONTACT_EMAIL ?? CONTACT_EMAIL;
  const payload = {
    to: recipient,
    from: "Palan Capital Site",
    subject: `[Palan Capital] ${sujet || "Nouvelle demande"} — ${nom}`,
    nom: nom.trim(),
    email: email.trim(),
    societe: societe?.trim() || "—",
    sujet: sujet?.trim() || "—",
    message: message?.trim() || "—",
    receivedAt: new Date().toISOString(),
  };

  // Log en dev / staging jusqu'à configuration email (Resend, etc.)
  console.info("[palan-capital/contact]", JSON.stringify(payload));

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.PALAN_FROM_EMAIL ?? "onboarding@resend.dev",
          to: recipient,
          reply_to: email.trim(),
          subject: payload.subject,
          text: [
            `Nom : ${payload.nom}`,
            `Email : ${payload.email}`,
            `Société : ${payload.societe}`,
            `Objet : ${payload.sujet}`,
            "",
            payload.message,
          ].join("\n"),
        }),
      });

      if (!res.ok) {
        throw new Error("Échec envoi email");
      }
    } catch {
      return NextResponse.json(
        { error: "Impossible d'envoyer le message pour le moment. Écrivez à contact@palancapital.com." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
