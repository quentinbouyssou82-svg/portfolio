/**
 * Journal d'audit minimal pour actions sensibles.
 * Persiste en table Supabase `driveely_security_audit` si disponible,
 * sinon logs structurés console (observabilité immédiate).
 */

import { getMargeoAdminDb } from "@/lib/margeo/supabase/admin";

export type SecurityAuditAction =
  | "auth.signup_rate_limited"
  | "auth.signin_failed"
  | "auth.signin_ok"
  | "subscription.activated"
  | "subscription.storekit_failed"
  | "account.deleted"
  | "account.export"
  | "admin.cron"
  | "security.rate_limited"
  | "security.app_attest_fail"
  | "security.botid_block";

export type SecurityAuditEntry = {
  action: SecurityAuditAction | string;
  userId?: string | null;
  meta?: Record<string, unknown>;
};

export async function writeSecurityAuditLog(
  entry: SecurityAuditEntry,
): Promise<void> {
  const payload = {
    action: entry.action,
    user_id: entry.userId ?? null,
    meta: entry.meta ?? {},
    created_at: new Date().toISOString(),
  };

  console.info("[driveely/audit]", payload);

  try {
    const admin = getMargeoAdminDb();
    const { error } = await admin.from("driveely_security_audit").insert(payload);
    if (error) {
      // Table absente = OK (migration optionnelle)
      if (!error.message?.includes("does not exist")) {
        console.warn("[driveely/audit] insert failed:", error.message);
      }
    }
  } catch {
    // Admin DB indispo en local — logs console suffisent
  }
}
