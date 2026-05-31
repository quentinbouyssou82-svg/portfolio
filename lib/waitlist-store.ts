/** Stockage temporaire en mémoire (dev / démo — non persistant sur Vercel serverless). */
const emails: string[] = [];
const seen = new Set<string>();

export function addWaitlistEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (seen.has(normalized)) {
    return { added: false, duplicate: true };
  }
  seen.add(normalized);
  emails.push(normalized);
  return { added: true, duplicate: false };
}

export function getWaitlistCount() {
  return emails.length;
}
