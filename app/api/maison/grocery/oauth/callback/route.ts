import { NextResponse } from "next/server";
import { MAISON_PATHS } from "@/lib/maison/constants";
import { getMaisonAppOrigin } from "@/lib/maison/grocery-providers/oauth-config";
import {
  GroceryOAuthError,
  handleGroceryOAuthCallback,
} from "@/lib/maison/grocery-providers/oauth";

export async function GET(request: Request) {
  const origin = getMaisonAppOrigin();
  const { searchParams } = new URL(request.url);

  try {
    const { integration, returnPath } = await handleGroceryOAuthCallback({
      code: searchParams.get("code"),
      state: searchParams.get("state"),
      error: searchParams.get("error"),
      origin,
    });

    const url = new URL(returnPath, origin);
    url.searchParams.set("oauth", "success");
    url.searchParams.set("provider", integration.provider);
    return NextResponse.redirect(url);
  } catch (e) {
    const message =
      e instanceof GroceryOAuthError ? e.message : e instanceof Error ? e.message : "Connexion échouée";
    const url = new URL(MAISON_PATHS.connexionCourses, origin);
    url.searchParams.set("oauth_error", message);
    return NextResponse.redirect(url);
  }
}
