"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Minus,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { CinematicReveal } from "@/components/motion/cinematic-reveal";
import { GsapStagger } from "@/components/motion/gsap-stagger";
import { PageSection } from "@/components/motion/page-section";
import { SubtleParallax } from "@/components/motion/subtle-parallax";
import { Button } from "@/components/ui/button";
import { CardHoverGlow } from "@/components/ui/card-hover-glow";
import { MagneticButton } from "@/components/ui/magnetic-button";
import {
  comparisonRows,
  pricingFaqs,
  pricingPlans,
  type BillingMode,
  type PricingPlan,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

type PricingSectionProps = {
  onContact: () => void;
};

function formatPrice(amount: number, mode: BillingMode) {
  if (mode === "monthly") {
    return { value: `${amount}€`, suffix: "/mois" };
  }
  return {
    value: `${amount.toLocaleString("fr-FR")}€`,
    suffix: "",
  };
}

function ComparisonCell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto size-4 text-emerald-500" aria-label="Inclus" />
    ) : (
      <Minus className="mx-auto size-4 text-[var(--muted)]/50" aria-label="Non inclus" />
    );
  }
  return <span className="text-sm text-[var(--foreground)]/90">{value}</span>;
}

function FaqItem({
  question,
  answer,
  open,
  onHover,
  onLeave,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onHover: () => void;
  onLeave: () => void;
  onToggle: () => void;
}) {
  return (
    <div
      className="pricing-faq-item overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full touch-target-sm cursor-default items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--surface-strong)]/50 max-md:py-4"
        aria-expanded={open}
      >
        <span className="text-sm font-medium md:text-base">{question}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[var(--muted)] transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="border-t border-[var(--border)] px-5 pb-4 pt-3 text-sm leading-7 text-[var(--muted)]">
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function setFeaturedGlow(event: React.MouseEvent<HTMLDivElement>, reset = false) {
  const bg = event.currentTarget.querySelector<HTMLElement>(".pricing-card-featured-bg");
  if (!bg) return;
  if (reset) {
    bg.style.setProperty("--glow-x", "50%");
    bg.style.setProperty("--glow-y", "35%");
    return;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  bg.style.setProperty("--glow-x", `${x}%`);
  bg.style.setProperty("--glow-y", `${y}%`);
}

function PricingPlanCard({
  plan,
  billingMode,
  onContact,
}: {
  plan: PricingPlan;
  billingMode: BillingMode;
  onContact: () => void;
}) {
  const price = billingMode === "monthly" ? plan.monthlyPrice : plan.projectPrice;
  const formatted = formatPrice(price, billingMode);
  const isFeatured = plan.highlighted;

  const cardInner = (
    <div className="pricing-card-inner flex h-full flex-col gap-4 p-5 md:p-6">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[0.1em]",
                isFeatured ? "text-[var(--accent)]" : "text-[var(--muted)]",
              )}
            >
              {plan.name}
            </p>
            {isFeatured ? (
              <>
                <Zap className="size-3.5 text-[var(--pricing-gold)]" aria-hidden />
                <span className="pricing-popular-badge">
                  <Star className="size-2.5 fill-[var(--pricing-gold)] text-[var(--pricing-gold)]" />
                  {plan.badge}
                </span>
              </>
            ) : null}
          </div>
          <p
            className={cn(
              "text-sm leading-6",
              isFeatured ? "text-[var(--foreground)]/88" : "text-[var(--muted)]",
            )}
          >
            {plan.tagline}
          </p>
        </div>

        <div className="pricing-price-block">
          <div className="flex flex-wrap items-end gap-x-1.5 gap-y-0.5">
            <span className="pricing-price tabular-nums" aria-label={`Prix ${plan.name}`}>
              {formatted.value}
            </span>
            {formatted.suffix ? (
              <span className="pricing-price-suffix">{formatted.suffix}</span>
            ) : null}
          </div>
        </div>

        {plan.featuredNote ? (
          <p className="pricing-featured-note rounded-lg border border-[var(--ring)]/35 bg-[var(--accent-soft)] px-3 py-2 text-[11px] leading-5 text-[var(--foreground)]/85">
            {plan.featuredNote}
          </p>
        ) : null}
      </div>

      <ul className="pricing-features flex-1 space-y-2 border-t border-[var(--border)]/80 pt-3.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[13px] leading-5">
            <span
              className={cn(
                "pricing-feature-icon mt-0.5 flex size-[1.15rem] shrink-0 items-center justify-center rounded-full",
                isFeatured && "pricing-feature-icon-featured",
              )}
            >
              <Check className="size-2.5" strokeWidth={2.5} />
            </span>
            <span
              className={cn(
                isFeatured ? "text-[var(--foreground)]/92" : "text-[var(--foreground)]/78",
              )}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <MagneticButton
        variant={isFeatured ? "default" : "outline"}
        size="default"
        className={cn(
          "pricing-cta w-full touch-target",
          isFeatured && "pricing-cta-featured hero-cta-primary",
          !isFeatured && "pricing-cta-secondary",
        )}
        onClick={onContact}
      >
        {plan.ctaLabel ?? (isFeatured ? "Choisir Pro" : "Demander un devis")}
        <ArrowRight className="size-4" />
      </MagneticButton>
    </div>
  );

  if (isFeatured) {
    return (
      <div className="pricing-card-featured-shell h-full">
        <div
          className="pricing-card-featured group relative h-full"
          onMouseMove={(e) => setFeaturedGlow(e)}
          onMouseLeave={(e) => setFeaturedGlow(e, true)}
        >
          <div aria-hidden className="pricing-card-featured-bg">
            <div className="pricing-card-featured-glow" />
            <div className="pricing-card-featured-light" />
          </div>
          {cardInner}
        </div>
      </div>
    );
  }

  return (
    <CardHoverGlow className="h-full rounded-[1.2rem]">
      <div className="pricing-card pricing-card-secondary group relative h-full overflow-hidden rounded-[1.2rem]">
        {cardInner}
      </div>
    </CardHoverGlow>
  );
}

export function PricingSection({ onContact }: PricingSectionProps) {
  const [billingMode, setBillingMode] = useState<BillingMode>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageSection id="pricing" className="relative space-y-10 max-md:space-y-9 md:max-lg:space-y-12 lg:space-y-14">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-0 z-0 h-56 w-56 opacity-40 max-lg:hidden"
      >
        <SubtleParallax maxOffset={6} className="size-full">
          <div className="size-full rounded-full bg-[var(--glow-soft)] blur-3xl" />
        </SubtleParallax>
      </div>

      <div className="relative z-[1] space-y-10 max-md:space-y-9 md:max-lg:space-y-12 lg:space-y-14">
      <CinematicReveal className="mx-auto max-w-3xl space-y-5 text-center">
        <p className="pricing-section-badge inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-1.5 text-xs tracking-[0.08em] text-[var(--muted)]">
          <Sparkles className="size-3.5 text-[var(--accent)]" />
          Tarifs transparents
        </p>
        <h2 className="hero-display text-[1.75rem] tracking-[-0.03em] max-md:text-[1.65rem] md:text-5xl">
          Des offres claires, pensées pour convertir
        </h2>
        <p className="text-base leading-7 text-[var(--muted)] max-md:leading-8 md:text-lg">
          Choisissez l&apos;offre adaptée à votre ambition. Chaque formule inclut un
          accompagnement professionnel et des révisions pour un résultat qui vous
          ressemble.
        </p>

        <div className="pricing-toggle inline-flex w-full max-w-sm items-center gap-1 rounded-full border border-[var(--border)] p-1 max-md:max-w-none">
          <button
            type="button"
            onClick={() => setBillingMode("monthly")}
            className={cn(
              "touch-target-sm flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 max-md:py-3",
              billingMode === "monthly"
                ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            Mensuel
          </button>
          <button
            type="button"
            onClick={() => setBillingMode("project")}
            className={cn(
              "touch-target-sm flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 max-md:py-3",
              billingMode === "project"
                ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            Achat
          </button>
        </div>
        <p className="text-xs text-[var(--muted)]">
          {billingMode === "monthly"
            ? "Hébergement, maintenance et mises à jour inclus."
            : "Paiement unique — sans abonnement mensuel."}
        </p>
      </CinematicReveal>

      <GsapStagger className="grid items-stretch gap-4 md:max-lg:grid-cols-2 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            data-stagger-item
            className={cn("h-full", plan.highlighted && "md:max-lg:col-span-2")}
          >
            <PricingPlanCard plan={plan} billingMode={billingMode} onContact={onContact} />
          </div>
        ))}
      </GsapStagger>

      <CinematicReveal delay={0.04}>
        <div className="pricing-guarantee flex flex-col items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-5 max-md:p-5 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-strong)]">
              <ShieldCheck className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold">Garantie satisfaction</p>
              <p className="mt-1 max-w-xl text-sm leading-7 text-[var(--muted)]">
                Révisions incluses sur chaque offre. Si le résultat ne correspond pas
                à ce qui a été validé ensemble, nous ajustons jusqu&apos;à votre
                satisfaction — sans frais cachés.
              </p>
            </div>
          </div>
          <MagneticButton variant="outline" onClick={onContact} className="w-full touch-target md:w-auto">
            Discuter de mon projet
          </MagneticButton>
        </div>
      </CinematicReveal>

      <CinematicReveal delay={0.06} className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">
            Comparer les offres
          </h3>
          <p className="text-sm text-[var(--muted)] md:text-base">
            Vue d&apos;ensemble pour choisir en toute confiance.
          </p>
        </div>

        <div className="pricing-comparison hidden overflow-x-auto rounded-2xl border border-[var(--border)] lg:block">
          <table className="pricing-table w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                  Fonctionnalité
                </th>
                <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                  Starter
                </th>
                <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-[0.06em] text-[var(--foreground)]">
                  Pro
                  <span className="mt-1 block text-[10px] font-normal normal-case text-[var(--pricing-gold)]">
                    Most Popular
                  </span>
                </th>
                <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-[0.06em] text-[var(--muted)]">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, index) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-[var(--border)]/70 transition-colors last:border-0 hover:bg-[var(--surface-strong)]/30",
                    index % 2 === 0 && "bg-[var(--background)]/20",
                  )}
                >
                  <td className="px-5 py-3.5 text-sm font-medium">{row.label}</td>
                  <td className="px-5 py-3.5 text-center opacity-80">
                    <ComparisonCell value={row.starter} />
                  </td>
                  <td className="pricing-comparison-pro px-5 py-3.5 text-center">
                    <ComparisonCell value={row.pro} />
                  </td>
                  <td className="px-5 py-3.5 text-center opacity-80">
                    <ComparisonCell value={row.premium} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pricing-comparison-mobile space-y-3 lg:hidden">
          {comparisonRows.map((row) => (
            <div
              key={row.label}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-4"
            >
              <p className="mb-3 text-sm font-semibold">{row.label}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="space-y-1 rounded-xl bg-[var(--background)]/30 p-2">
                  <p className="font-medium uppercase tracking-wide text-[var(--muted)]">Starter</p>
                  <ComparisonCell value={row.starter} />
                </div>
                <div className="pricing-comparison-pro space-y-1 rounded-xl p-2">
                  <p className="font-medium uppercase tracking-wide text-[var(--foreground)]">Pro</p>
                  <ComparisonCell value={row.pro} />
                </div>
                <div className="space-y-1 rounded-xl bg-[var(--background)]/30 p-2">
                  <p className="font-medium uppercase tracking-wide text-[var(--muted)]">Premium</p>
                  <ComparisonCell value={row.premium} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CinematicReveal>

      <CinematicReveal delay={0.08} className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-[-0.02em] md:text-2xl">
            Questions fréquentes
          </h3>
          <p className="text-sm text-[var(--muted)] md:text-base">
            Tout ce qu&apos;il faut savoir avant de démarrer.
          </p>
        </div>

        <div className="space-y-3">
          {pricingFaqs.map((faq, index) => (
            <FaqItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              open={openFaq === index}
              onHover={() => setOpenFaq(index)}
              onLeave={() => setOpenFaq(null)}
              onToggle={() => setOpenFaq(openFaq === index ? null : index)}
            />
          ))}
        </div>
      </CinematicReveal>
      </div>
    </PageSection>
  );
}
