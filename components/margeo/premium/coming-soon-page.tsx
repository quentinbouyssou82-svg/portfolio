import { Crown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/margeo/ui/button";
import { JoinBetaCta } from "@/components/margeo/beta/join-beta-cta";
import { margeoRoutes } from "@/lib/margeo/routes";

/**
 * Mode public avant Stripe : conserve la page premium, bloque l’achat.
 */
export function ComingSoonPremiumPage() {
  return (
    <div className="mx-auto max-w-lg px-5 py-16 text-center sm:py-24">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-mg-accent/25 bg-mg-accent-soft">
        <Crown className="size-7 text-mg-accent" aria-hidden />
      </div>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-mg-foreground text-balance">
        Ouverture prochaine
      </h1>
      <p className="mt-3 text-base leading-relaxed text-mg-muted text-pretty">
        Les abonnements Premium seront disponibles dès que le paiement sera
        finalisé. En attendant, rejoins la bêta pour tester toutes les
        fonctionnalités gratuitement.
      </p>
      <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:justify-center">
        <JoinBetaCta label="Rejoindre la bêta" />
        <Link href={margeoRoutes.dashboard} className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" className="w-full min-h-12">
            Retour à l’app
          </Button>
        </Link>
      </div>
    </div>
  );
}
