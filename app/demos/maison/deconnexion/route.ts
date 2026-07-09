import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MAISON_PATHS, MAISON_SESSION_COOKIE } from "@/lib/maison/constants";

/** Déconnexion — Route Handler (seul endroit autorisé pour supprimer le cookie en GET) */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete({ name: MAISON_SESSION_COOKIE, path: "/" });

  return NextResponse.redirect(new URL(MAISON_PATHS.connexion, request.url));
}
