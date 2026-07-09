import { NextResponse } from "next/server";
import {
  getMaisonAppOrigin,
  getProviderOAuthEnv,
  isProviderOAuthConfigured,
  supportsProviderOAuthRedirect,
} from "@/lib/maison/grocery-providers/oauth-config";

export async function GET() {
  const origin = getMaisonAppOrigin();
  const leclerc = getProviderOAuthEnv("leclerc_drive");

  return NextResponse.json({
    ok: true,
    appOrigin: origin,
    providers: {
      leclerc_drive: {
        supportsRedirect: supportsProviderOAuthRedirect("leclerc_drive"),
        oauthConfigured: isProviderOAuthConfigured("leclerc_drive"),
        authorizeUrl: leclerc.authorizeUrl,
        startUrl: `${origin}/api/maison/grocery/oauth/start?provider=leclerc_drive`,
        callbackUrl: `${origin}/api/maison/grocery/oauth/callback`,
        returnPageUrl: `${origin}/demos/maison/connexion-courses/retour`,
      },
      netto: {
        supportsRedirect: supportsProviderOAuthRedirect("netto"),
        oauthConfigured: isProviderOAuthConfigured("netto"),
        note: "Netto — connexion OAuth à brancher ultérieurement",
      },
    },
  });
}
