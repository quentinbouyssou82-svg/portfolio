"use client";

import { useState, useMemo, useRef, useEffect, type FormEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Menu,
  X,
  Hammer,
  ChefHat,
  Bath,
  ArrowLeftRight,
  MessageCircle,
  Send,
  Calculator,
  Shield,
  Award,
  Users,
  CheckCircle2,
} from "lucide-react";
import { images } from "@/lib/demo-images";
import { cn, scrollToId } from "@/lib/utils";
import { Reveal } from "@/components/demos/reveal";
import { DemoNotice } from "@/components/demos/demo-notice";

const NAV = [
  { id: "accueil", label: "Accueil" },
  { id: "services", label: "Services" },
  { id: "realisations", label: "Réalisations" },
  { id: "avis", label: "Avis" },
  { id: "devis", label: "Devis" },
  { id: "contact", label: "Contact" },
] as const;

type ProjectType = "complete" | "kitchen" | "bathroom";
type FinishLevel = "standard" | "premium" | "luxe";

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "complete", label: "Rénovation complète" },
  { value: "kitchen", label: "Cuisine" },
  { value: "bathroom", label: "Salle de bain" },
];

const RATE_BY_TYPE: Record<ProjectType, { min: number; max: number }> = {
  complete: { min: 850, max: 1250 },
  kitchen: { min: 400, max: 650 },
  bathroom: { min: 950, max: 1500 },
};

const FINISH_RATES: Record<FinishLevel, number> = {
  standard: 680,
  premium: 980,
  luxe: 1450,
};

const FINISH_LABELS: Record<FinishLevel, string> = {
  standard: "Standard",
  premium: "Premium",
  luxe: "Luxe",
};

const SERVICES = [
  {
    icon: Hammer,
    title: "Rénovation complète",
    desc: "Reprise totale de votre logement : gros œuvre, second œuvre, finitions haut de gamme et coordination des corps de métier.",
    image: images.novaHabitat.service1,
    features: ["Diagnostic & plans 3D", "Gestion de chantier", "Garantie décennale"],
  },
  {
    icon: ChefHat,
    title: "Cuisine",
    desc: "Cuisines sur mesure, agencement optimisé et pose d'équipements premium pour un espace convivial et fonctionnel.",
    image: images.novaHabitat.service2,
    features: ["Plans sur mesure", "Électroménager intégré", "Plan de travail pierre"],
  },
  {
    icon: Bath,
    title: "Salle de bain",
    desc: "Création ou rénovation de salles de bain spa : douche italienne, carrelage grand format, robinetterie design.",
    image: images.novaHabitat.service3,
    features: ["Étanchéité certifiée", "Carrelage XXL", "VMC & éclairage LED"],
  },
];

const GALLERY_PROJECTS = [
  {
    title: "Appartement Haussmannien",
    location: "Paris 16e",
    surface: "95 m²",
    before: images.novaHabitat.before1,
    after: images.novaHabitat.after1,
  },
  {
    title: "Cuisine contemporaine",
    location: "Neuilly-sur-Seine",
    surface: "18 m²",
    before: images.novaHabitat.before2,
    after: images.novaHabitat.after2,
  },
  {
    title: "Suite parentale",
    location: "Boulogne-Billancourt",
    surface: "32 m²",
    before: images.novaHabitat.before3,
    after: images.novaHabitat.after3,
  },
];

const TESTIMONIALS = [
  {
    name: "Sophie L.",
    project: "Rénovation complète · Paris 11e",
    text: "Nova Habitat a transformé notre appartement en 4 mois, dans les délais annoncés. L'équipe est rigoureuse, le chantier toujours propre. Résultat bluffant.",
    rating: 5,
  },
  {
    name: "Thomas B.",
    project: "Cuisine sur mesure · Levallois",
    text: "De la conception 3D à la pose, tout s'est déroulé sans accroc. La cuisine est exactement celle que nous avions imaginée, avec une finition impeccable.",
    rating: 5,
  },
  {
    name: "Marie-Claire D.",
    project: "Salle de bain · Saint-Cloud",
    text: "Douche à l'italienne, carrelage grand format — un vrai espace spa. Le devis initial a été respecté à l'euro près. Je recommande sans hésiter.",
    rating: 5,
  },
  {
    name: "Julien P.",
    project: "Rénovation · Versailles",
    text: "Interlocuteur unique, réactivité au top. Les artisans sont soigneux et le suivi de chantier via l'application est très pratique. Excellent rapport qualité-prix.",
    rating: 4,
  },
];

const SERVICE_ZONES = [
  "Paris (tous arrondissements)",
  "Hauts-de-Seine (92)",
  "Seine-Saint-Denis (93)",
  "Val-de-Marne (94)",
  "Yvelines (78)",
  "Essonne (91)",
  "Seine-et-Marne (77)",
  "Val-d'Oise (95)",
];

const TIMELINES = [
  "Dès que possible",
  "1 à 3 mois",
  "3 à 6 mois",
  "Plus de 6 mois",
];

const BUDGET_RANGES = [
  "Moins de 20 000 €",
  "20 000 – 50 000 €",
  "50 000 – 100 000 €",
  "Plus de 100 000 €",
];

type ChatMessage = { role: "user" | "bot"; text: string };

function formatPrice(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function estimateProject(type: ProjectType, surface: number) {
  const rate = RATE_BY_TYPE[type];
  return {
    min: Math.round(surface * rate.min),
    max: Math.round(surface * rate.max),
  };
}

function getBotReply(input: string): string {
  const lower = input.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  if (lower.includes("devis")) {
    return "Pour obtenir un devis personnalisé, remplissez le formulaire dans la section Devis ou appelez-nous au 01 84 80 12 00. Réponse sous 48 h ouvrées, visite gratuite incluse.";
  }
  if (lower.includes("delai") || lower.includes("duree")) {
    return "Les délais varient selon le projet : cuisine 3–4 semaines, salle de bain 2–3 semaines, rénovation complète 3 à 6 mois. Nous établissons un planning détaillé dès la signature.";
  }
  if (lower.includes("prix") || lower.includes("cout") || lower.includes("tarif")) {
    return "Comptez environ 850–1 250 €/m² pour une rénovation complète, 400–650 €/m² pour une cuisine et 950–1 500 €/m² pour une salle de bain. Utilisez notre calculateur pour une estimation instantanée.";
  }
  if (lower.includes("cuisine")) {
    return "Nous concevons des cuisines sur mesure : plans 3D, choix des matériaux, pose et raccordements. Budget moyen : 15 000 à 35 000 € selon la surface et les finitions.";
  }
  if (lower.includes("salle de bain") || lower.includes("sdb")) {
    return "Nos salles de bain incluent douche italienne, carrelage grand format, robinetterie premium et VMC. Budget moyen : 8 000 à 18 000 € pour une salle de bain standard.";
  }
  return "Merci pour votre message ! Je suis l'assistant Nova Habitat. Posez-moi une question sur les devis, délais, prix, cuisines ou salles de bain. Pour un conseil personnalisé, contactez-nous au 01 84 80 12 00.";
}

function NavLink({
  id,
  label,
  onNavigate,
}: {
  id: string;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        scrollToId(id);
        onNavigate?.();
      }}
      className="text-sm font-medium text-[var(--nova-muted)] transition-colors hover:text-[var(--nova-navy)]"
    >
      {label}
    </button>
  );
}

function BeforeAfterCard({
  project,
  index,
}: {
  project: (typeof GALLERY_PROJECTS)[number];
  index: number;
}) {
  const [showAfter, setShowAfter] = useState(false);

  return (
    <Reveal delay={index * 0.08}>
      <article className="nova-card group overflow-hidden rounded-2xl">
        <button
          type="button"
          onClick={() => setShowAfter((v) => !v)}
          className="relative block aspect-[4/3] w-full overflow-hidden"
          aria-label={showAfter ? "Voir avant" : "Voir après"}
        >
          <Image
            src={showAfter ? project.after : project.before}
            alt={`${project.title} — ${showAfter ? "après" : "avant"} rénovation`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f2744]/70 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[var(--nova-navy)] shadow-sm">
            <ArrowLeftRight className="size-3.5 text-[var(--nova-accent)]" aria-hidden />
            {showAfter ? "Après" : "Avant"}
          </span>
          <span className="absolute bottom-3 right-3 rounded-lg bg-[var(--nova-accent)] px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            Cliquer pour {showAfter ? "avant" : "après"}
          </span>
        </button>
        <div className="p-5">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <p className="mt-1 text-sm text-[var(--nova-muted)]">
            {project.location} · {project.surface}
          </p>
        </div>
      </article>
    </Reveal>
  );
}

export default function NovaHabitatPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteState, setQuoteState] = useState<"idle" | "loading" | "success">("idle");
  const [projectType, setProjectType] = useState<ProjectType>("complete");
  const [surface, setSurface] = useState(60);
  const [calcSurface, setCalcSurface] = useState(80);
  const [finishLevel, setFinishLevel] = useState<FinishLevel>("premium");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Bonjour ! Je suis l'assistant Nova Habitat. Comment puis-je vous aider ? (devis, délais, prix, cuisine, salle de bain…)",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const liveEstimate = useMemo(
    () => estimateProject(projectType, surface),
    [projectType, surface]
  );

  const budgetEstimate = useMemo(
    () => Math.round(calcSurface * FINISH_RATES[finishLevel]),
    [calcSurface, finishLevel]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatOpen]);

  function handleQuoteSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (quoteState === "loading") return;
    setQuoteState("loading");
    window.setTimeout(() => setQuoteState("success"), 1400);
  }

  function sendChatMessage(e: FormEvent) {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    setChatMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setChatInput("");
    window.setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: "bot", text: getBotReply(trimmed) }]);
    }, 600);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--nova-bg)] text-[var(--nova-navy)]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--nova-border)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-6">
          <button
            type="button"
            onClick={() => scrollToId("accueil")}
            className="text-lg font-bold tracking-tight text-[var(--nova-navy)] sm:text-xl"
          >
            Nova<span className="text-[var(--nova-accent)]">Habitat</span>
          </button>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Navigation principale">
            {NAV.map((item) => (
              <NavLink key={item.id} id={item.id} label={item.label} />
            ))}
          </nav>

          <button
            type="button"
            className="nova-btn hidden text-xs md:inline-flex"
            onClick={() => scrollToId("devis")}
          >
            Devis gratuit
            <ChevronRight className="size-4" aria-hidden />
          </button>

          <button
            type="button"
            className="rounded-lg border border-[var(--nova-border)] p-2 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-[var(--nova-border)] bg-white md:hidden"
            >
              <nav className="flex flex-col gap-4 px-4 py-6" aria-label="Navigation mobile">
                {NAV.map((item) => (
                  <NavLink
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    onNavigate={() => setMenuOpen(false)}
                  />
                ))}
                <button
                  type="button"
                  className="nova-btn mt-2 w-full"
                  onClick={() => {
                    scrollToId("devis");
                    setMenuOpen(false);
                  }}
                >
                  Demander un devis
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero */}
        <section id="accueil" className="relative flex min-h-[100svh] items-center">
          <Image
            src={images.novaHabitat.hero}
            alt="Intérieur rénové par Nova Habitat"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2744]/90 via-[#0f2744]/75 to-[#0f2744]/40" />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-32 sm:px-6">
            <Reveal>
              <p className="nova-section-tag">Paris & Île-de-France · Depuis 2008</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
                Votre rénovation,
                <span className="block text-[var(--nova-accent)]">clés en main</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                Artisans qualifiés, suivi de chantier digital et garantie décennale.
                Transformez votre intérieur en toute sérénité.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  className="nova-btn"
                  onClick={() => scrollToId("devis")}
                >
                  Devis gratuit en 48 h
                  <ChevronRight className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="nova-btn-outline border-white/25 bg-white/10 text-white backdrop-blur-sm hover:border-white/40 hover:bg-white/15"
                  onClick={() => scrollToId("realisations")}
                >
                  Voir nos réalisations
                </button>
              </div>
            </Reveal>

            <Reveal delay={0.15} className="mt-16 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {[
                { icon: Award, value: "500+", label: "Projets livrés" },
                { icon: Shield, value: "10 ans", label: "Garantie décennale" },
                { icon: Users, value: "4.9/5", label: "Satisfaction client" },
                { icon: Clock, value: "48 h", label: "Réponse devis" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center rounded-xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur-sm sm:items-start sm:text-left"
                >
                  <stat.icon className="size-5 text-[var(--nova-accent)]" aria-hidden />
                  <p className="mt-2 text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-white/65">{stat.label}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Services */}
        <section id="services" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="text-center">
              <p className="nova-section-tag">Nos expertises</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Services de rénovation
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[var(--nova-muted)]">
                De la conception à la livraison, un interlocuteur unique pour chaque type de projet.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {SERVICES.map((service, i) => (
                <Reveal key={service.title} delay={i * 0.08}>
                  <article className="nova-card group flex h-full flex-col overflow-hidden rounded-2xl">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-xl bg-white shadow-md">
                        <service.icon className="size-5 text-[var(--nova-accent)]" aria-hidden />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--nova-muted)]">
                        {service.desc}
                      </p>
                      <ul className="mt-5 space-y-2">
                        {service.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-center gap-2 text-sm text-[var(--nova-navy)]"
                          >
                            <CheckCircle2
                              className="size-4 shrink-0 text-[var(--nova-accent)]"
                              aria-hidden
                            />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Réalisations + Budget calculator */}
        <section id="realisations" className="border-t border-[var(--nova-border)] bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="text-center">
              <p className="nova-section-tag">Portfolio</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Avant / Après
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[var(--nova-muted)]">
                Cliquez sur une photo pour basculer entre l&apos;état initial et le résultat final.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {GALLERY_PROJECTS.map((project, i) => (
                <BeforeAfterCard key={project.title} project={project} index={i} />
              ))}
            </div>

            <Reveal delay={0.1} className="mt-16">
              <div className="nova-card rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--nova-accent)]/10">
                    <Calculator className="size-6 text-[var(--nova-accent)]" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">Calculateur de budget</h3>
                    <p className="mt-1 text-sm text-[var(--nova-muted)]">
                      Estimez le coût de votre rénovation en fonction de la surface et du niveau de
                      finition.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <label htmlFor="calc-surface" className="text-sm font-medium">
                          Surface
                        </label>
                        <span className="text-sm font-semibold text-[var(--nova-accent)]">
                          {calcSurface} m²
                        </span>
                      </div>
                      <input
                        id="calc-surface"
                        type="range"
                        min={20}
                        max={200}
                        step={5}
                        value={calcSurface}
                        onChange={(e) => setCalcSurface(Number(e.target.value))}
                        className="nova-slider"
                      />
                      <div className="mt-1 flex justify-between text-xs text-[var(--nova-muted)]">
                        <span>20 m²</span>
                        <span>200 m²</span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-sm font-medium">Niveau de finition</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(FINISH_LABELS) as FinishLevel[]).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFinishLevel(level)}
                            className={cn(
                              "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                              finishLevel === level
                                ? "border-[var(--nova-accent)] bg-[var(--nova-accent)]/10 text-[var(--nova-accent)]"
                                : "border-[var(--nova-border)] text-[var(--nova-muted)] hover:border-[var(--nova-accent)]/30"
                            )}
                          >
                            {FINISH_LABELS[level]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center rounded-xl bg-[var(--nova-bg)] p-6 text-center">
                    <p className="text-sm text-[var(--nova-muted)]">Budget estimé</p>
                    <motion.p
                      key={budgetEstimate}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-4xl font-bold text-[var(--nova-navy)]"
                    >
                      {formatPrice(budgetEstimate)}
                    </motion.p>
                    <p className="mt-3 text-xs text-[var(--nova-muted)]">
                      Estimation indicative · Devis précis après visite sur site
                    </p>
                    <button
                      type="button"
                      className="nova-btn mt-6 w-full sm:w-auto"
                      onClick={() => scrollToId("devis")}
                    >
                      Obtenir un devis exact
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Avis */}
        <section id="avis" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="text-center">
              <p className="nova-section-tag">Témoignages</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Ce que disent nos clients
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[var(--nova-muted)]">
                Plus de 500 projets livrés en Île-de-France avec une note moyenne de 4,9/5.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.06}>
                  <blockquote className="nova-card flex h-full flex-col rounded-2xl p-6">
                    <div className="flex gap-0.5 text-amber-400" aria-label={`${t.rating} étoiles`}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={cn(
                            "size-4",
                            j < t.rating ? "fill-current" : "fill-none text-amber-200"
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--nova-muted)]">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <footer className="mt-5 border-t border-[var(--nova-border)] pt-4">
                      <p className="font-semibold">{t.name}</p>
                      <p className="mt-0.5 text-xs text-[var(--nova-muted)]">{t.project}</p>
                    </footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Devis */}
        <section id="devis" className="border-t border-[var(--nova-border)] bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <Reveal>
                <p className="nova-section-tag">Devis gratuit</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Demandez votre estimation
                </h2>
                <p className="mt-4 text-[var(--nova-muted)]">
                  Décrivez votre projet et recevez une fourchette de prix instantanée, puis un devis
                  détaillé sous 48 h après visite gratuite.
                </p>

                <div className="nova-card mt-8 rounded-2xl p-6">
                  <p className="text-sm font-medium text-[var(--nova-muted)]">
                    Estimation instantanée
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="nova-label">Type de projet</span>
                      <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value as ProjectType)}
                        className="nova-input"
                      >
                        {PROJECT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="nova-label">Surface (m²)</span>
                      <input
                        type="number"
                        min={5}
                        max={500}
                        value={surface}
                        onChange={(e) => setSurface(Number(e.target.value) || 0)}
                        className="nova-input"
                      />
                    </label>
                  </div>
                  <motion.div
                    key={`${projectType}-${surface}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 rounded-xl bg-[var(--nova-bg)] p-5 text-center"
                  >
                    <p className="text-sm text-[var(--nova-muted)]">Fourchette estimée</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--nova-accent)]">
                      {formatPrice(liveEstimate.min)} – {formatPrice(liveEstimate.max)}
                    </p>
                  </motion.div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                {quoteState === "success" ? (
                  <div className="nova-card rounded-2xl p-8 text-center">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle2 className="size-8 text-emerald-500" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-2xl font-bold">Demande envoyée !</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--nova-muted)]">
                      Merci pour votre confiance. Un chargé de projet Nova Habitat vous contactera
                      sous 48 h pour planifier une visite gratuite et affiner votre devis.
                    </p>
                    <button
                      type="button"
                      className="nova-btn mt-8"
                      onClick={() => setQuoteState("idle")}
                    >
                      Nouvelle demande
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuoteSubmit} className="nova-card space-y-5 rounded-2xl p-6 sm:p-8">
                    <label className="block">
                      <span className="nova-label">Type de projet *</span>
                      <select name="projectType" required defaultValue="" className="nova-input">
                        <option value="" disabled>
                          Sélectionner
                        </option>
                        {PROJECT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="nova-label">Surface (m²) *</span>
                        <input
                          type="number"
                          name="surface"
                          required
                          min={5}
                          placeholder="60"
                          className="nova-input"
                        />
                      </label>
                      <label className="block">
                        <span className="nova-label">Budget envisagé *</span>
                        <select name="budget" required defaultValue="" className="nova-input">
                          <option value="" disabled>
                            Sélectionner
                          </option>
                          {BUDGET_RANGES.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="block">
                      <span className="nova-label">Délai souhaité *</span>
                      <select name="timeline" required defaultValue="" className="nova-input">
                        <option value="" disabled>
                          Sélectionner
                        </option>
                        {TIMELINES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block">
                        <span className="nova-label">Nom complet *</span>
                        <input
                          type="text"
                          name="name"
                          required
                          autoComplete="name"
                          placeholder="Jean Dupont"
                          className="nova-input"
                        />
                      </label>
                      <label className="block">
                        <span className="nova-label">Téléphone *</span>
                        <input
                          type="tel"
                          name="phone"
                          required
                          autoComplete="tel"
                          placeholder="06 12 34 56 78"
                          className="nova-input"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="nova-label">E-mail *</span>
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        placeholder="jean.dupont@email.fr"
                        className="nova-input"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={quoteState === "loading"}
                      className={cn(
                        "nova-btn w-full",
                        quoteState === "loading" && "pointer-events-none opacity-70"
                      )}
                    >
                      {quoteState === "loading" ? "Envoi en cours…" : "Envoyer ma demande de devis"}
                    </button>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        {/* Contact + Service area */}
        <section id="contact" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mb-12 text-center">
              <p className="nova-section-tag">Contact</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Parlons de votre projet
              </h2>
            </Reveal>

            <div className="grid gap-8 lg:grid-cols-2">
              <Reveal>
                <div className="nova-card overflow-hidden rounded-2xl">
                  <div className="relative flex aspect-[16/10] flex-col items-center justify-center bg-gradient-to-br from-[#0f2744] to-[#1a3a5c] p-8 text-center">
                    <MapPin className="size-12 text-[var(--nova-accent)]" aria-hidden />
                    <h3 className="mt-4 text-xl font-semibold text-white">
                      Zone d&apos;intervention
                    </h3>
                    <p className="mt-2 text-sm text-white/70">
                      Paris & Île-de-France — déplacement gratuit
                    </p>
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute left-1/4 top-1/4 size-32 rounded-full border-2 border-white" />
                      <div className="absolute right-1/4 bottom-1/4 size-48 rounded-full border-2 border-white" />
                      <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--nova-accent)]" />
                    </div>
                  </div>
                  <ul className="grid grid-cols-1 gap-2 p-6 sm:grid-cols-2">
                    {SERVICE_ZONES.map((zone) => (
                      <li
                        key={zone}
                        className="flex items-center gap-2 text-sm text-[var(--nova-muted)]"
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-[var(--nova-accent)]" />
                        {zone}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={0.1} className="space-y-6">
                <div className="nova-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold">Siège & horaires</h3>
                  <ul className="mt-4 space-y-4 text-sm text-[var(--nova-muted)]">
                    <li className="flex gap-3">
                      <MapPin
                        className="mt-0.5 size-4 shrink-0 text-[var(--nova-accent)]"
                        aria-hidden
                      />
                      <span>42 avenue de la Grande Armée, 75017 Paris</span>
                    </li>
                    <li className="flex gap-3">
                      <Clock
                        className="mt-0.5 size-4 shrink-0 text-[var(--nova-accent)]"
                        aria-hidden
                      />
                      <span>
                        Lun–Ven 8h–19h · Sam 9h–13h
                        <br />
                        Urgences chantier 7j/7
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="nova-card rounded-2xl p-6">
                  <h3 className="text-lg font-semibold">Coordonnées</h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li>
                      <a
                        href="tel:+33184801200"
                        className="flex items-center gap-3 text-[var(--nova-muted)] transition-colors hover:text-[var(--nova-navy)]"
                      >
                        <Phone className="size-4 text-[var(--nova-accent)]" aria-hidden />
                        01 84 80 12 00
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:contact@novahabitat.fr"
                        className="flex items-center gap-3 text-[var(--nova-muted)] transition-colors hover:text-[var(--nova-navy)]"
                      >
                        <Mail className="size-4 text-[var(--nova-accent)]" aria-hidden />
                        contact@novahabitat.fr
                      </a>
                    </li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--nova-border)] bg-white py-10">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
          <DemoNotice variant="light" />
          <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-[var(--nova-muted)] sm:flex-row sm:text-left">
            <span className="text-sm font-bold text-[var(--nova-navy)]">
              Nova<span className="text-[var(--nova-accent)]">Habitat</span>
            </span>
            <p>© {new Date().getFullYear()} · Démonstration conceptuelle — Tous droits réservés</p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-[var(--nova-border)] bg-white shadow-2xl sm:right-6"
            role="dialog"
            aria-label="Assistant Nova Habitat"
          >
            <div className="flex items-center justify-between bg-[var(--nova-navy)] px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5 text-[var(--nova-accent)]" aria-hidden />
                <span className="text-sm font-semibold text-white">Assistant Nova Habitat</span>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-lg p-1 text-white/70 transition-colors hover:text-white"
                aria-label="Fermer le chat"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex max-h-72 flex-col gap-3 overflow-y-auto p-4">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "ml-auto rounded-br-md bg-[var(--nova-accent)] text-white"
                      : "rounded-bl-md bg-[var(--nova-bg)] text-[var(--nova-navy)]"
                  )}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={sendChatMessage}
              className="flex gap-2 border-t border-[var(--nova-border)] p-3"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Posez votre question…"
                className="nova-input flex-1 py-2"
                aria-label="Votre message"
              />
              <button
                type="submit"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--nova-accent)] text-white transition-colors hover:bg-[#1a6ae8]"
                aria-label="Envoyer"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setChatOpen((o) => !o)}
        className="fixed bottom-6 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-[var(--nova-accent)] text-white shadow-lg shadow-[var(--nova-accent)]/30 transition-transform hover:scale-105 sm:right-6"
        aria-label={chatOpen ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        whileTap={{ scale: 0.95 }}
      >
        {chatOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </motion.button>
    </div>
  );
}
