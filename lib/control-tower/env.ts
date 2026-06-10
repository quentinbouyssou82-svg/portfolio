import {
  getControlTowerPin,
  getControlTowerUserId,
} from "@/lib/control-tower/pin-session";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getControlTowerSupabaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim()
  );
}

export function getControlTowerSupabaseAnonKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim()
  );
}

export function hasControlTowerDbKey(): boolean {
  return Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
      getControlTowerSupabaseAnonKey(),
  );
}

export function isValidControlTowerUserId(id: string | undefined): boolean {
  return Boolean(id && UUID_RE.test(id));
}

export type ControlTowerConfigStatus = {
  ok: boolean;
  missing: string[];
};

export function getControlTowerConfigStatus(): ControlTowerConfigStatus {
  const missing: string[] = [];

  const url = getControlTowerSupabaseUrl();
  if (!url) missing.push("SUPABASE_URL");
  else if (!url.includes("supabase.co")) missing.push("SUPABASE_URL (invalide)");

  if (!hasControlTowerDbKey()) {
    missing.push("SUPABASE_ANON_KEY ou SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!getControlTowerPin()) missing.push("CONTROL_TOWER_PIN");
  if (!getControlTowerUserId()) missing.push("CONTROL_TOWER_USER_ID");
  else if (!isValidControlTowerUserId(getControlTowerUserId())) {
    missing.push("CONTROL_TOWER_USER_ID (UUID invalide)");
  }

  return { ok: missing.length === 0, missing };
}

export function isControlTowerConfigured(): boolean {
  return getControlTowerConfigStatus().ok;
}

/** Log dev uniquement — diagnostic chargement .env.local */
export function logControlTowerConfigInDev(): void {
  if (process.env.NODE_ENV !== "development") return;

  const status = getControlTowerConfigStatus();
  console.info("[control-tower] config", {
    ok: status.ok,
    missing: status.missing,
    pin: Boolean(getControlTowerPin()),
    userId: getControlTowerUserId() ?? null,
    supabaseUrl: Boolean(getControlTowerSupabaseUrl()),
    dbKey: hasControlTowerDbKey() ? "present" : "missing",
  });
}
