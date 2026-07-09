import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { ConnexionCoursesClient } from "@/components/maison/connexion-courses-client";
import { MaisonSignOutButton } from "@/components/maison/maison-sign-out-button";
import { requireMaisonGrocerySetupSession } from "@/lib/maison/auth/session";
import { MAISON_PATHS } from "@/lib/maison/constants";
import { isGroceryGateBypassed } from "@/lib/maison/dev/constants";
import { getGroceryIntegration, isGroceryProviderConnected } from "@/lib/maison/grocery-providers";

export default async function MaisonConnexionCoursesPage() {
  const session = await requireMaisonGrocerySetupSession();

  if (
    !isGroceryGateBypassed(session.household.household_key) &&
    isGroceryProviderConnected(await getGroceryIntegration(session.householdId))
  ) {
    redirect(MAISON_PATHS.home);
  }

  const integration = await getGroceryIntegration(session.householdId);
  const isAdmin = session.role === "admin";

  return (
    <div className="min-h-dvh bg-cream flex flex-col">
      <div className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <div className="animate-rise mb-8">
          <div className="size-12 rounded-2xl bg-sage-soft grid place-items-center mb-5">
            <ShoppingBag className="h-5 w-5 text-sage" strokeWidth={1.75} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ash mb-2">Courses</p>
          <h1 className="font-serif text-3xl text-ink mb-2 leading-tight">
            Connecter votre supermarché
          </h1>
          <p className="text-sm text-ash leading-relaxed">
            {isAdmin
              ? "Choisissez votre enseigne pour débloquer l'accès à Maison et synchroniser vos listes."
              : "Demandez à l'administrateur du foyer de connecter un compte supermarché."}
          </p>
        </div>

        {isAdmin ? (
          <div className="animate-rise delay-100">
            <ConnexionCoursesClient initialIntegration={integration} />
          </div>
        ) : (
          <div className="rounded-2xl bg-paper ring-1 ring-black/[0.04] p-5 animate-rise delay-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-start gap-3">
              <div className="size-10 shrink-0 rounded-xl bg-sage-soft grid place-items-center">
                <ShoppingBag className="h-4 w-4 text-sage" strokeWidth={1.75} />
              </div>
              <p className="text-sm text-ash leading-relaxed">
                L&apos;accès à l&apos;application est bloqué tant qu&apos;aucune enseigne n&apos;est
                connectée. Contactez l&apos;administrateur du foyer.
              </p>
            </div>
          </div>
        )}

        <p className="text-center mt-8 animate-fade-in delay-200">
          <MaisonSignOutButton variant="link" />
        </p>
      </div>
    </div>
  );
}
