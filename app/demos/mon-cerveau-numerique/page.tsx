import Link from "next/link";
import { ArrowRight, Brain, Shield, Sparkles } from "lucide-react";
import { McnFooter } from "@/components/mon-cerveau-numerique/mcn-footer";
import { McnBadge } from "@/components/mon-cerveau-numerique/ui/badge";
import { McnButton } from "@/components/mon-cerveau-numerique/ui/button";
import {
  McnCard,
  McnCardContent,
  McnCardDescription,
  McnCardHeader,
  McnCardTitle,
} from "@/components/mon-cerveau-numerique/ui/card";
import { MCN_PATHS } from "@/lib/mon-cerveau-numerique/constants";
import { landingFeatures, landingStats } from "@/lib/mon-cerveau-numerique/content";

export default function McnLandingPage() {
  return (
    <main className="min-h-screen px-4 pb-16 sm:px-6">
      <section className="mx-auto max-w-3xl pt-24 pb-20 text-center sm:pt-32">
        <McnBadge className="mcn-animate-in mb-6">
          <Sparkles className="size-3" />
          Ton assistant de vie personnel
        </McnBadge>

        <h1 className="mcn-animate-in mcn-delay-1 text-4xl font-semibold tracking-tight text-[var(--mcn-fg)] sm:text-6xl sm:leading-[1.05]">
          <span className="bg-gradient-to-br from-white via-white to-[var(--mcn-accent)] bg-clip-text text-transparent">
            Mon Cerveau
          </span>
          <br />
          Numérique
        </h1>

        <p className="mcn-animate-in mcn-delay-2 mx-auto mt-6 max-w-xl text-base leading-relaxed text-[var(--mcn-fg-muted)] sm:text-lg">
          GED intelligente, to-do proactive, veille personnalisée et gestion de ta vie perso &amp; pro
          — tout centralisé, tout automatisé, 100% gratuit.
        </p>

        <div className="mcn-animate-in mcn-delay-3 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={MCN_PATHS.onboarding}>
            <McnButton size="lg" className="min-w-[220px]">
              Démarrer — c&apos;est gratuit
              <ArrowRight className="size-4" />
            </McnButton>
          </Link>
          <Link href={MCN_PATHS.login}>
            <McnButton variant="outline" size="lg" className="min-w-[220px]">
              J&apos;ai déjà un compte
            </McnButton>
          </Link>
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-4xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {landingStats.map((stat, i) => (
            <McnCard
              key={stat.label}
              className="mcn-animate-in transition-colors hover:border-[var(--mcn-border-strong)] hover:bg-[var(--mcn-surface-hover)]"
              style={{ animationDelay: `${0.2 + i * 0.05}s` }}
            >
              <McnCardContent className="p-4 text-center sm:p-5">
                <p className="text-2xl font-semibold tracking-tight text-[var(--mcn-accent)] sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-[var(--mcn-fg-muted)] sm:text-xs">
                  {stat.label}
                </p>
              </McnCardContent>
            </McnCard>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tout ce dont tu as besoin
          </h2>
          <p className="mt-2 text-sm text-[var(--mcn-fg-muted)]">
            Une seule app. Toute ta vie organisée.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {landingFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <McnCard
                key={feature.title}
                className="mcn-animate-in group transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--mcn-border-strong)] hover:bg-[var(--mcn-surface-hover)]"
                style={{ animationDelay: `${0.3 + i * 0.04}s` }}
              >
                <McnCardHeader>
                  <div
                    className="mb-1 flex size-9 items-center justify-center rounded-lg border transition-colors group-hover:border-[var(--mcn-border-strong)]"
                    style={{ background: feature.iconBg, borderColor: feature.iconBorder }}
                  >
                    <Icon size={18} className={feature.iconClass} />
                  </div>
                  <McnCardTitle>{feature.title}</McnCardTitle>
                  <McnCardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </McnCardDescription>
                </McnCardHeader>
              </McnCard>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-2xl">
        <McnCard className="border-emerald-500/20 bg-emerald-500/[0.03]">
          <McnCardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
              <Shield className="size-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">Tes données, ton contrôle</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--mcn-fg-muted)]">
              Chiffrement AES-256 sur tous tes documents. Jamais d&apos;action sans ta confirmation.
              Aucun partage de données à des tiers. RGPD respecté.
            </p>
          </McnCardContent>
        </McnCard>
      </section>

      <section className="mx-auto max-w-xl text-center">
        <McnCard>
          <McnCardContent className="p-8 sm:p-10">
            <Brain className="mx-auto mb-4 size-8 text-[var(--mcn-accent)]" />
            <h2 className="text-xl font-semibold tracking-tight">Prêt à organiser ta vie ?</h2>
            <p className="mt-2 text-sm text-[var(--mcn-fg-muted)]">
              L&apos;onboarding prend 5 minutes. Ensuite, ton cerveau numérique travaille pour toi.
            </p>
            <Link href={MCN_PATHS.onboarding} className="mt-6 inline-block">
              <McnButton>
                Commencer maintenant
                <ArrowRight className="size-4" />
              </McnButton>
            </Link>
          </McnCardContent>
        </McnCard>
      </section>

      <McnFooter />
    </main>
  );
}
