const RATE_LIMIT_MS = 30_000;
const RATE_LIMIT_KEY = "nocta-waitlist-last-submit";

export type WaitlistResponse = {
  success: boolean;
  message?: string;
};

function checkClientRateLimit() {
  if (typeof window === "undefined") return;

  const last = Number(sessionStorage.getItem(RATE_LIMIT_KEY) || 0);
  const now = Date.now();

  if (last && now - last < RATE_LIMIT_MS) {
    throw new Error("Veuillez patienter quelques secondes avant de réessayer.");
  }

  sessionStorage.setItem(RATE_LIMIT_KEY, String(now));
}

export async function submitWaitlist(email: string): Promise<WaitlistResponse> {
  checkClientRateLimit();

  const response = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });

  const payload = (await response.json()) as WaitlistResponse;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message ?? "Impossible de vous inscrire. Réessayez plus tard.");
  }

  return payload;
}

export const waitlistSuccessMessage = "Vous êtes sur la liste !";
