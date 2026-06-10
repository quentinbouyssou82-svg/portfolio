import type { WaitlistEntry } from "@/lib/waitlist-types";

/** Colonnes alignées sur la table Supabase `waitlist`. */
export type WaitlistRow = {
  email: string;
  name?: string;
  company?: string;
  website?: string;
  need?: string;
  source?: string;
};

export type WaitlistUpdateRow = Omit<WaitlistRow, "email">;

/**
 * Ligne complète pour INSERT — sans clés null/vides.
 */
export function buildWaitlistRow(entry: WaitlistEntry): WaitlistRow {
  const row: WaitlistRow = {
    email: entry.email.trim().toLowerCase(),
    source: entry.source?.trim() || "priority_list",
  };

  const name = entry.name?.trim();
  const company = entry.company?.trim();
  const website = entry.website?.trim();
  const need = entry.need?.trim();

  if (name) row.name = name;
  if (company) row.company = company;
  if (website) row.website = website;
  if (need) row.need = need;

  return row;
}

/**
 * Champs pour UPDATE uniquement — jamais d'email, jamais de null écrasant.
 */
export function buildWaitlistUpdateRow(entry: WaitlistEntry): WaitlistUpdateRow {
  const update: WaitlistUpdateRow = {
    source: entry.source?.trim() || "priority_list",
  };

  const name = entry.name?.trim();
  const company = entry.company?.trim();
  const website = entry.website?.trim();
  const need = entry.need?.trim();

  if (name) update.name = name;
  if (company) update.company = company;
  if (website) update.website = website;
  if (need) update.need = need;

  return update;
}

export function logWaitlistRow(label: string, row: WaitlistRow | WaitlistUpdateRow) {
  console.info(`[waitlist] ${label}:`, JSON.stringify(row));
}
