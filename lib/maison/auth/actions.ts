"use server";

import { redirect } from "next/navigation";
import { MAISON_PATHS } from "@/lib/maison/constants";
import { verifyPinHash } from "@/lib/maison/env";
import {
  clearMaisonSessionCookie,
  setMaisonSessionCookie,
} from "@/lib/maison/household-session";
import {
  createHousehold,
  getHouseholdByKey,
  getMemberPinHash,
  listHouseholdMembers,
} from "@/lib/maison/services/households";
import { createMember } from "@/lib/maison/services/members";
import type { ActionResult } from "@/lib/maison/types";

export async function createHouseholdAction(formData: FormData): Promise<
  ActionResult<{ householdKey: string }>
> {
  const name = String(formData.get("householdName") ?? "").trim();
  const adminName = String(formData.get("adminName") ?? "Administrateur").trim() || "Administrateur";
  const pin = String(formData.get("pin") ?? "");
  const budgetStr = String(formData.get("budgetMonthly") ?? "480");

  if (!name || !pin) {
    return { ok: false, message: "Nom du foyer et code PIN requis." };
  }
  if (pin.length < 4) {
    return { ok: false, message: "Le code PIN doit contenir au moins 4 chiffres." };
  }

  try {
    const budgetMonthly = parseFloat(budgetStr) || 480;
    const { household, member, householdKey } = await createHousehold({
      name,
      adminName,
      adminPin: pin,
      budgetMonthly,
    });

    await setMaisonSessionCookie(household.id, member.id);
    return { ok: true, data: { householdKey } };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Impossible de créer le foyer";
    if (msg.includes("fetch failed") || msg.includes("ENOTFOUND")) {
      return {
        ok: false,
        message:
          "Impossible de joindre Supabase. Vérifie SUPABASE_URL dans .env.local (copie l’URL exacte depuis Supabase → Connect), redémarre npm run dev, puis réessaie.",
      };
    }
    return { ok: false, message: msg };
  }
}

export async function lookupHouseholdAction(
  householdKey: string,
): Promise<
  ActionResult<{ householdName: string; members: Array<{ id: string; name: string; role: string }> }>
> {
  try {
    const household = await getHouseholdByKey(householdKey);
    if (!household) {
      return { ok: false, message: "Clé de foyer introuvable. Vérifiez le code (ex: FAM-8K2X9Q)." };
    }

    const members = await listHouseholdMembers(household.id);
    return {
      ok: true,
      data: {
        householdName: household.name,
        members: members.map((m) => ({ id: m.id, name: m.name, role: m.role })),
      },
    };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function loginMemberAction(formData: FormData): Promise<ActionResult> {
  const householdKey = String(formData.get("householdKey") ?? "").trim().toUpperCase();
  const memberId = String(formData.get("memberId") ?? "");
  const pin = String(formData.get("pin") ?? "");

  if (!householdKey || !memberId || !pin) {
    return { ok: false, message: "Clé, membre et PIN requis." };
  }

  try {
    const household = await getHouseholdByKey(householdKey);
    if (!household) return { ok: false, message: "Foyer introuvable." };

    const pinHash = await getMemberPinHash(memberId);
    if (!pinHash) return { ok: false, message: "Membre introuvable." };

    const valid = await verifyPinHash(pin, household.id, pinHash);
    if (!valid) return { ok: false, message: "Code PIN incorrect." };

    await setMaisonSessionCookie(household.id, memberId);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Connexion impossible" };
  }
}

export async function joinAsNewMemberAction(formData: FormData): Promise<ActionResult> {
  const householdKey = String(formData.get("householdKey") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const pin = String(formData.get("pin") ?? "");

  if (!householdKey || !name || !pin) {
    return { ok: false, message: "Clé, prénom et PIN requis." };
  }
  if (pin.length < 4) {
    return { ok: false, message: "PIN : minimum 4 chiffres." };
  }

  try {
    const household = await getHouseholdByKey(householdKey);
    if (!household) return { ok: false, message: "Foyer introuvable." };

    const member = await createMember(household.id, { name, pin, role: "member" });
    await setMaisonSessionCookie(household.id, member.id);
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Erreur" };
  }
}

export async function signOutAction(): Promise<void> {
  await clearMaisonSessionCookie();
  redirect(MAISON_PATHS.connexion);
}

/** @deprecated */
export async function signInAction(): Promise<ActionResult> {
  return { ok: false, message: "Utilisez la clé de foyer et votre PIN." };
}

/** @deprecated */
export async function signUpAction(): Promise<ActionResult> {
  return { ok: false, message: "Créez un foyer via « Créer un foyer »." };
}
