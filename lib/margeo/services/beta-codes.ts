/**
 * Codes bêta Premium — création + redeem (serveur uniquement).
 * iOS format : 6 caractères A-Z0-9 (ex. AB7KQ2).
 */

import { randomBytes } from "node:crypto";
import { getMargeoAdminDb } from "../supabase/admin";
import { invalidateEntitlementsCache } from "./subscription";

const CODE_LENGTH = 6;
/** Alphabet sans 0/O/1/I pour lisibilité livreur. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type BetaCodeRedeemResult =
  | { ok: true; already: boolean }
  | {
      ok: false;
      error:
        | "BETA_CODE_INVALID"
        | "BETA_CODE_EXPIRED"
        | "BETA_CODE_ALREADY_USED"
        | "BETA_CODE_UNAVAILABLE"
        | "UNAUTHORIZED";
    };

export function normalizeBetaCode(raw: string): string {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH);
}

export function isCompleteBetaCode(normalized: string): boolean {
  return /^[A-Z0-9]{6}$/.test(normalized);
}

export function generateBetaCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return out;
}

export type CreateBetaCodeInput = {
  /** Nombre d’utilisations max (défaut 1 = one-time). */
  maxUses?: number;
  /** Expiration ISO ou Date (optionnel). */
  expiresAt?: string | Date | null;
  /** Note fondateur (ex. « livreur Lyon »). */
  note?: string | null;
  /** Code explicite (sinon généré). Doit être 6 alphanum. */
  code?: string | null;
};

export type CreatedBetaCode = {
  id: string;
  code: string;
  maxUses: number;
  expiresAt: string | null;
  note: string | null;
  createdAt: string;
};

export type BetaCodeStatus = "available" | "redeemed" | "revoked" | "expired";

export type BetaCodeListItem = {
  id: string;
  code: string;
  display: string;
  active: boolean;
  maxUses: number;
  useCount: number;
  expiresAt: string | null;
  note: string | null;
  createdAt: string;
  status: BetaCodeStatus;
};

type BetaCodeRow = {
  id: string;
  code: string;
  active: boolean;
  max_uses: number;
  use_count: number;
  expires_at: string | null;
  note: string | null;
  created_at: string;
};

export function formatBetaCodeDisplay(code: string): string {
  const normalized = normalizeBetaCode(code);
  if (normalized.length <= 3) return normalized;
  return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
}

function statusFromRow(row: BetaCodeRow, now = Date.now()): BetaCodeStatus {
  if (!row.active) return "revoked";
  if (row.expires_at && new Date(row.expires_at).getTime() <= now) {
    return "expired";
  }
  if (row.use_count >= row.max_uses) return "redeemed";
  return "available";
}

function toListItem(row: BetaCodeRow): BetaCodeListItem {
  return {
    id: row.id,
    code: row.code,
    display: formatBetaCodeDisplay(row.code),
    active: row.active,
    maxUses: row.max_uses,
    useCount: row.use_count,
    expiresAt: row.expires_at,
    note: row.note,
    createdAt: row.created_at,
    status: statusFromRow(row),
  };
}

export async function createBetaCode(
  input: CreateBetaCodeInput = {},
): Promise<CreatedBetaCode> {
  const admin = getMargeoAdminDb();
  const maxUses = Math.max(1, Math.floor(input.maxUses ?? 1));
  const note = input.note?.trim() || null;
  const expiresAt = input.expiresAt
    ? new Date(input.expiresAt).toISOString()
    : null;

  let lastError: unknown;
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = input.code
      ? normalizeBetaCode(input.code)
      : generateBetaCode();
    if (!isCompleteBetaCode(code)) {
      throw new Error("Code invalide (6 caractères A-Z0-9 requis)");
    }

    const { data, error } = await admin
      .from("driveely_beta_codes")
      .insert({
        code,
        max_uses: maxUses,
        expires_at: expiresAt,
        note,
        active: true,
        use_count: 0,
      })
      .select("id, code, max_uses, expires_at, note, created_at")
      .single();

    if (!error && data) {
      const row = data as {
        id: string;
        code: string;
        max_uses: number;
        expires_at: string | null;
        note: string | null;
        created_at: string;
      };
      return {
        id: row.id,
        code: row.code,
        maxUses: row.max_uses,
        expiresAt: row.expires_at,
        note: row.note,
        createdAt: row.created_at,
      };
    }

    lastError = error;
    const isUnique =
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "23505";
    if (input.code) {
      if (isUnique) throw new Error("duplicate key");
      break;
    }
  }

  throw new Error(
    `Impossible de créer le code: ${
      lastError && typeof lastError === "object" && "message" in lastError
        ? String((lastError as { message: string }).message)
        : String(lastError)
    }`,
  );
}

export async function createBetaCodes(
  input: CreateBetaCodeInput & { count?: number } = {},
): Promise<BetaCodeListItem[]> {
  const count = Math.min(20, Math.max(1, Math.floor(input.count ?? 1)));
  if (input.code && count > 1) {
    throw new Error("Un code explicite ne peut pas être créé en lot");
  }
  const created: BetaCodeListItem[] = [];
  for (let i = 0; i < count; i++) {
    const row = await createBetaCode({
      maxUses: input.maxUses,
      expiresAt: input.expiresAt,
      note: input.note,
      code: input.code,
    });
    created.push(
      toListItem({
        id: row.id,
        code: row.code,
        active: true,
        max_uses: row.maxUses,
        use_count: 0,
        expires_at: row.expiresAt,
        note: row.note,
        created_at: row.createdAt,
      }),
    );
  }
  return created;
}

export async function listBetaCodes(): Promise<BetaCodeListItem[]> {
  const admin = getMargeoAdminDb();
  const { data, error } = await admin
    .from("driveely_beta_codes")
    .select("id, code, active, max_uses, use_count, expires_at, note, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Impossible de lister les codes: ${error.message}`);
  }

  return ((data ?? []) as BetaCodeRow[]).map(toListItem);
}

export async function redeemBetaCodeForUser(
  userId: string,
  rawCode: string,
): Promise<BetaCodeRedeemResult> {
  if (!userId) {
    return { ok: false, error: "UNAUTHORIZED" };
  }

  const normalized = normalizeBetaCode(rawCode);
  if (!isCompleteBetaCode(normalized)) {
    return { ok: false, error: "BETA_CODE_INVALID" };
  }

  const admin = getMargeoAdminDb();
  const { data, error } = await admin.rpc("driveely_redeem_beta_code", {
    p_code: normalized,
    p_user_id: userId,
  });

  if (error) {
    console.error("[driveely/beta-codes] rpc failed:", error.message);
    return { ok: false, error: "BETA_CODE_UNAVAILABLE" };
  }

  const payload = data as {
    ok?: boolean;
    already?: boolean;
    error?: string;
  } | null;

  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "BETA_CODE_UNAVAILABLE" };
  }

  if (payload.ok) {
    invalidateEntitlementsCache(userId);
    return { ok: true, already: Boolean(payload.already) };
  }

  const err = String(payload.error ?? "BETA_CODE_INVALID");
  switch (err) {
    case "BETA_CODE_EXPIRED":
    case "BETA_CODE_ALREADY_USED":
    case "BETA_CODE_UNAVAILABLE":
    case "UNAUTHORIZED":
    case "BETA_CODE_INVALID":
      return { ok: false, error: err };
    default:
      return { ok: false, error: "BETA_CODE_INVALID" };
  }
}

/** Désactive un code (ne révoque pas les comptes déjà redeemés). */
export async function deactivateBetaCode(code: string): Promise<boolean> {
  const admin = getMargeoAdminDb();
  const normalized = normalizeBetaCode(code);
  const { error, count } = await admin
    .from("driveely_beta_codes")
    .update({ active: false }, { count: "exact" })
    .eq("code", normalized);
  return !error && (count ?? 0) > 0;
}

/** Révoque Premium bêta d’un utilisateur (is_beta_tester = false). */
export async function revokeBetaTester(userId: string): Promise<void> {
  const admin = getMargeoAdminDb();
  await admin
    .from("margeo_profiles")
    .update({ is_beta_tester: false })
    .eq("id", userId);
  invalidateEntitlementsCache(userId);
}
