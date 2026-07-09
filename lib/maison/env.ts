export function getMaisonSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim()
  );
}

export function getMaisonServiceKey(): string | undefined {
  return (
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export function isMaisonConfigured(): boolean {
  return Boolean(getMaisonSupabaseUrl() && getMaisonServiceKey());
}

export function getMaisonConfigStatus(): {
  configured: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!getMaisonSupabaseUrl()) missing.push("SUPABASE_URL");
  if (!getMaisonServiceKey()) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY");
  }
  return { configured: missing.length === 0, missing };
}

export function getPinSecret(): string {
  return (
    process.env.MAISON_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "maison-dev-secret-change-me"
  );
}

export async function hashPin(pin: string, householdId: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${getPinSecret()}:${householdId}:${pin}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPinHash(
  pin: string,
  householdId: string,
  pinHash: string,
): Promise<boolean> {
  const computed = await hashPin(pin, householdId);
  if (computed.length !== pinHash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ pinHash.charCodeAt(i);
  }
  return diff === 0;
}

export function generateHouseholdKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `FAM-${code}`;
}
