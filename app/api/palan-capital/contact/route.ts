import { NextResponse } from "next/server";
import { CONTACT_EMAIL, PUBLIC_CONTACT_EMAIL } from "@/lib/palan-capital/constants";
import { sendContactEmails } from "@/lib/palan-capital/email";

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const nom = typeof data.nom === "string" ? data.nom.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const societe = typeof data.societe === "string" ? data.societe.trim() : "";
  const sujet = typeof data.sujet === "string" ? data.sujet.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";
  const rgpd = data.rgpd;

  if (!nom || !email || !email.includes("@") || !sujet || !rgpd) {
    return NextResponse.json({ error: "Veuillez remplir tous les champs obligatoires." }, { status: 400 });
  }

  const payload = { nom, email, societe, sujet, message };

  console.info("[palan-capital/contact]", {
    nom,
    email,
    societe: societe || "—",
    sujet,
    recipient: CONTACT_EMAIL,
  });

  try {
    const result = await sendContactEmails(payload);

    if (!result.notification.ok) {
      console.info("[palan-capital/contact] Resend non configuré — demande loggée:", payload);
      return NextResponse.json({
        success: true,
        dev: true,
        message: `Demande enregistrée (mode dev). En production : ${CONTACT_EMAIL}`,
      });
    }

    if (!result.autoReply.ok) {
      console.warn("[palan-capital/contact] Notification OK, auto-reply failed for", email);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[palan-capital/contact]", err);
    return NextResponse.json({ error: "Erreur lors de l'envoi. Réessayez ou écrivez à " + PUBLIC_CONTACT_EMAIL }, { status: 500 });
  }
}
