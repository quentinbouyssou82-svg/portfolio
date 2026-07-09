import { NextResponse } from "next/server";
import { getMaisonSession } from "@/lib/maison/auth/session";
import { MAISON_PATHS } from "@/lib/maison/constants";
import type { GroceryProviderId } from "@/lib/maison/grocery-providers/config";
import { getMaisonAppOrigin } from "@/lib/maison/grocery-providers/oauth-config";
import {
  buildGroceryOAuthAuthorizeUrl,
  GroceryOAuthError,
} from "@/lib/maison/grocery-providers/oauth";

const VALID_PROVIDERS = new Set<GroceryProviderId>(["leclerc_drive", "netto", "other"]);

export async function GET(request: Request) {
  try {
    const session = await getMaisonSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Seul l'administrateur peut connecter le supermarché." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const provider = (searchParams.get("provider") ?? "leclerc_drive") as GroceryProviderId;
    const storeId = searchParams.get("storeId") ?? undefined;
    const returnPath = searchParams.get("returnPath") ?? MAISON_PATHS.connexionCourses;

    if (!VALID_PROVIDERS.has(provider) || provider === "other") {
      return NextResponse.json({ error: "Enseigne invalide" }, { status: 400 });
    }

    const origin = getMaisonAppOrigin();
    const authorizeUrl = await buildGroceryOAuthAuthorizeUrl({
      householdId: session.householdId,
      memberId: session.memberId,
      provider,
      storeId,
      returnPath,
      origin,
    });

    return NextResponse.redirect(authorizeUrl);
  } catch (e) {
    const message = e instanceof GroceryOAuthError ? e.message : e instanceof Error ? e.message : "Erreur OAuth";
    const url = new URL(MAISON_PATHS.connexionCourses, getMaisonAppOrigin());
    url.searchParams.set("oauth_error", message);
    return NextResponse.redirect(url);
  }
}
