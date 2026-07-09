import { redirect } from "next/navigation";
import { MaisonSignOutButton } from "@/components/maison/maison-sign-out-button";
import { getMaisonSession } from "@/lib/maison/auth/session";
import { MAISON_PATHS } from "@/lib/maison/constants";

export default async function EnAttentePage() {
  const session = await getMaisonSession();

  if (!session) {
    redirect(MAISON_PATHS.connexion);
  }

  if (session.household.onboarding_completed) {
    redirect(MAISON_PATHS.home);
  }

  if (session.role === "admin") {
    redirect(MAISON_PATHS.onboarding);
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center animate-rise">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-sage mb-3">
          Maison
        </p>
        <h1 className="font-serif text-4xl text-ink leading-tight">
          Configuration en cours
        </h1>
        <p className="mt-4 text-sm text-muted-foreground text-pretty">
          L&apos;administrateur du foyer termine la configuration alimentaire.
          Revenez dans quelques instants — votre accès sera automatique.
        </p>
        <p className="mt-6 text-xs text-ash">
          Connecté en tant que <span className="font-medium text-ink">{session.member.name}</span>
        </p>
        <div className="mt-8">
          <MaisonSignOutButton />
        </div>
      </div>
    </div>
  );
}
