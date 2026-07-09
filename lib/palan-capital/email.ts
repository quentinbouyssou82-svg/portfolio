import { AUTO_REPLY_BODY, CONTACT_EMAIL, FROM_EMAIL } from "./constants";

export type ContactPayload = {
  nom: string;
  email: string;
  societe?: string;
  sujet: string;
  message?: string;
};

async function sendResendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false as const, reason: "no_api_key" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Palan Capital <${FROM_EMAIL}>`,
      to: [to],
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[palan-capital/email] Resend error:", res.status, body);
    return { ok: false as const, reason: "api_error" };
  }

  return { ok: true as const };
}

export async function sendContactEmails(payload: ContactPayload) {
  const notificationText = [
    "Nouvelle demande de contact — Palan Capital",
    "",
    `Nom : ${payload.nom}`,
    `Email : ${payload.email}`,
    `Société : ${payload.societe || "—"}`,
    `Objet : ${payload.sujet}`,
    "",
    payload.message || "(aucun message)",
  ].join("\n");

  const notification = await sendResendEmail(
    CONTACT_EMAIL,
    `[Palan Capital] ${payload.sujet} — ${payload.nom}`,
    notificationText,
  );

  const autoReply = await sendResendEmail(
    payload.email,
    "Palan Capital — Demande bien reçue",
    AUTO_REPLY_BODY,
  );

  return { notification, autoReply };
}
