"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Dumbbell,
  Flame,
  Menu,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { Reveal } from "@/components/demos/reveal";
import { DemoNotice } from "@/components/demos/demo-notice";
import { images } from "@/lib/demo-images";
import { cn, scrollToId } from "@/lib/utils";

const navItems = [
  { id: "accueil", label: "Accueil" },
  { id: "programmes", label: "Programmes" },
  { id: "coachs", label: "Coachs" },
  { id: "tarifs", label: "Tarifs" },
  { id: "transformations", label: "Transformations" },
  { id: "contact", label: "Contact" },
];

const programmes = [
  {
    title: "Force",
    description:
      "Progression linéaire, charges lourdes et technique parfaite pour bâtir une base solide.",
    image: images.titanFitness.program1,
    icon: Dumbbell,
    tag: "Hypertrophie",
  },
  {
    title: "HIIT",
    description:
      "Intervals explosifs pour brûler les calories, améliorer le VO₂ max et rester affûté.",
    image: images.titanFitness.program2,
    icon: Flame,
    tag: "Cardio",
  },
  {
    title: "Performance",
    description:
      "Préparation athlétique complète : mobilité, puissance et résistance mentale au top.",
    image: images.titanFitness.program3,
    icon: Zap,
    tag: "Elite",
  },
];

const coaches = [
  {
    name: "Marcus Reed",
    role: "Head Coach · Force",
    bio: "Ex-athlète NCAA, 12 ans d'expérience en powerlifting et préparation physique.",
    image: images.titanFitness.coach1,
    specialty: "Squat · Deadlift · Periodisation",
  },
  {
    name: "Sofia Alvarez",
    role: "Coach · HIIT & Conditioning",
    bio: "Spécialiste cardio fonctionnel, certifiée CrossFit L2 et nutrition sportive.",
    image: images.titanFitness.coach2,
    specialty: "MetCon · Endurance · Recovery",
  },
  {
    name: "Jordan Blake",
    role: "Coach · Performance",
    bio: "Ancien préparateur physique pro, expert en biomécanique et prévention des blessures.",
    image: images.titanFitness.coach3,
    specialty: "Mobilité · Vitesse · Agilité",
  },
];

const plans = [
  {
    name: "Essentiel",
    price: 29,
    description: "L'accès complet à la salle, idéal pour démarrer fort.",
    features: [
      "Accès illimité 6h–23h",
      "Zone musculation & cardio",
      "1 séance découverte offerte",
      "Application de suivi",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: 49,
    description: "Notre formule la plus populaire — résultats accélérés.",
    features: [
      "Tout Essentiel inclus",
      "2 cours collectifs / semaine",
      "Programme personnalisé",
      "Bilan composition corporelle mensuel",
      "Accès sauna & recovery",
    ],
    highlighted: true,
  },
  {
    name: "Elite",
    price: 79,
    description: "Coaching premium pour performers et compétiteurs.",
    features: [
      "Tout Pro inclus",
      "Coaching privé 2× / semaine",
      "Plan nutrition sur mesure",
      "Accès 24/7 prioritaire",
      "Suivi vidéo des mouvements",
    ],
    highlighted: false,
  },
];

const faqItems = [
  {
    question: "L'essai gratuit inclut-il un coach ?",
    answer:
      "Oui. Votre première séance inclut un briefing personnalisé avec un coach certifié qui évalue votre niveau, vos objectifs et vous oriente vers le programme adapté.",
  },
  {
    question: "Puis-je suspendre mon abonnement ?",
    answer:
      "Absolument. Les formules Pro et Elite permettent une pause de 30 jours par an sans frais. Contactez notre équipe au moins 7 jours avant la date souhaitée.",
  },
  {
    question: "Faut-il une expérience préalable en salle ?",
    answer:
      "Non. Nos programmes sont modulables du débutant à l'athlète confirmé. Chaque exercice est adapté à votre niveau avec des progressions claires.",
  },
  {
    question: "Proposez-vous des cours en ligne ?",
    answer:
      "Les membres Pro et Elite accèdent à notre bibliothèque de séances live et replay, complétée par un suivi via l'application Titan.",
  },
];

const transformations = [
  {
    name: "Thomas L.",
    duration: "4 mois",
    result: "−14 kg · +8 kg muscle",
    quote:
      "Je pensais que les salles premium étaient intimidantes. Titan m'a prouvé le contraire — résultats concrets en 16 semaines.",
    before: "92 kg",
    after: "78 kg",
    image: images.titanFitness.transform1,
  },
  {
    name: "Camille R.",
    duration: "3 mois",
    result: "+40 % endurance · −6 % masse grasse",
    quote:
      "Le programme HIIT avec Sofia a transformé mon énergie au quotidien. Je cours mon premier semi-marathon cette année.",
    before: "28 % BF",
    after: "22 % BF",
    image: images.titanFitness.transform2,
  },
  {
    name: "Karim D.",
    duration: "6 mois",
    result: "+65 kg squat · −9 kg",
    quote:
      "Marcus m'a appris à soulever lourd sans me blesser. Mon squat a explosé et ma confiance aussi.",
    before: "120 kg squat",
    after: "185 kg squat",
    image: images.titanFitness.transform3,
  },
];

type Goal = "perte" | "muscle" | "endurance";

function getBmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Insuffisance pondérale";
  if (bmi < 25) return "Poids normal";
  if (bmi < 30) return "Surpoids";
  return "Obésité";
}

function estimateWeeks(goal: Goal, frequency: number): number {
  const base = { perte: 14, muscle: 18, endurance: 10 }[goal];
  const factor = Math.max(frequency, 1) / 3;
  return Math.max(4, Math.round(base / factor));
}

function TitanNav({
  activeId,
  mobileOpen,
  onToggleMobile,
  onNavigate,
}: {
  activeId: string;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <button
          type="button"
          onClick={() => onNavigate("accueil")}
          className="flex items-center gap-2 text-left"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--titan-accent)] text-[#050505]">
            <Trophy className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Titan<span className="text-[var(--titan-accent)]">Fitness</span>
          </span>
        </button>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={cn(
                "titan-nav-link",
                activeId === item.id && "is-active",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("contact")}
            className="titan-btn titan-btn-solid hidden text-sm sm:inline-flex"
          >
            Essai gratuit
          </button>
          <button
            type="button"
            onClick={onToggleMobile}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-white/10 lg:hidden"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/5 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-left text-sm font-medium transition",
                    activeId === item.id
                      ? "bg-[var(--titan-accent-dim)] text-[var(--titan-accent)]"
                      : "text-white/70 hover:bg-white/5",
                  )}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onNavigate("contact")}
                className="titan-btn titan-btn-solid mt-2 w-full"
              >
                Essai gratuit
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question} className="titan-card overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-medium">{item.question}</span>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-[var(--titan-accent)] transition-transform duration-300",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="border-t border-white/5 px-5 pb-4 pt-2 text-sm leading-relaxed text-[var(--titan-muted)]">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function TitanFitnessPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState("accueil");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState<Goal>("perte");
  const [frequency, setFrequency] = useState(3);
  const [formSent, setFormSent] = useState(false);

  const bmi = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const meters = h / 100;
    return w / (meters * meters);
  }, [height, weight]);

  const estimatedWeeks = useMemo(
    () => estimateWeeks(goal, frequency),
    [goal, frequency],
  );

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  function handleNavigate(id: string) {
    setMobileOpen(false);
    setActiveId(id);
    scrollToId(id);
  }

  function handleTrialSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormSent(true);
  }

  const headlines = [
    "Repoussez vos limites.",
    "Devenez plus fort.",
    "Transformez votre corps.",
  ];
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % headlines.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [headlines.length]);

  return (
    <>
      <TitanNav
        activeId={activeId}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen((open) => !open)}
        onNavigate={handleNavigate}
      />

      <main>
        {/* Hero — Accueil */}
        <section
          id="accueil"
          className="relative overflow-hidden titan-hero-gradient titan-grid-bg"
        >
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-2 lg:items-center">
            <div>
              <Reveal>
                <p className="titan-section-label">Premium American Gym</p>
                <div className="mt-4 min-h-[2.6em] overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.h1
                      key={headlineIndex}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -24 }}
                      transition={{ duration: 0.45 }}
                      className="text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
                    >
                      {headlines[headlineIndex]}
                    </motion.h1>
                  </AnimatePresence>
                </div>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--titan-muted)]">
                  Équipements de pointe, coaching d&apos;élite et une communauté
                  qui ne fait pas de compromis. Votre meilleure version commence
                  ici.
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => handleNavigate("contact")}
                    className="titan-btn titan-btn-solid"
                  >
                    Essai gratuit
                    <ArrowRight className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate("programmes")}
                    className="titan-btn"
                  >
                    Voir les programmes
                  </button>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div className="titan-stat-bar mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl">
                  <div className="bg-[#050505] px-5 py-5">
                    <p className="text-3xl font-black text-[var(--titan-accent)] md:text-4xl">
                      5000+
                    </p>
                    <p className="mt-1 text-sm text-[var(--titan-muted)]">
                      Membres actifs
                    </p>
                  </div>
                  <div className="bg-[#050505] px-5 py-5">
                    <p className="text-3xl font-black text-[var(--titan-accent)] md:text-4xl">
                      98%
                    </p>
                    <p className="mt-1 text-sm text-[var(--titan-muted)]">
                      Satisfaction
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1} className="relative">
              <div className="titan-glow-strong relative aspect-[4/5] overflow-hidden rounded-3xl">
                <Image
                  src={images.titanFitness.hero}
                  alt="Athlète s'entraînant à Titan Fitness"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 titan-card rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <Target className="size-5 text-[var(--titan-accent)]" />
                    <div>
                      <p className="text-sm font-semibold">Objectif du mois</p>
                      <p className="text-xs text-[var(--titan-muted)]">
                        +12 % de force moyenne chez nos membres Pro
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Programmes */}
        <section id="programmes" className="border-t border-white/5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="titan-section-label">Programmes</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Trois voies. Un seul objectif : la performance.
              </h2>
            </Reveal>

            <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
              {programmes.map((program, index) => (
                <Reveal key={program.title} delay={index * 0.08}>
                  <article className="titan-card group flex h-full flex-col overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:border-[var(--titan-accent)]/30">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                      <span className="absolute left-4 top-4 rounded-full bg-[var(--titan-accent)] px-3 py-1 text-xs font-bold uppercase text-[#050505]">
                        {program.tag}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2">
                        <program.icon className="size-5 text-[var(--titan-accent)]" />
                        <h3 className="text-xl font-bold">{program.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--titan-muted)]">
                        {program.description}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Coachs */}
        <section id="coachs" className="border-t border-white/5 bg-[var(--titan-bg-elevated)] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="titan-section-label">Coachs</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Des experts qui performent avec vous.
              </h2>
            </Reveal>

            <div className="mt-12 grid items-stretch gap-6 md:grid-cols-3">
              {coaches.map((coach, index) => (
                <Reveal key={coach.name} delay={index * 0.08}>
                  <article className="titan-card flex h-full flex-col overflow-hidden rounded-3xl">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={coach.image}
                        alt={coach.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold">{coach.name}</h3>
                      <p className="mt-1 text-sm text-[var(--titan-accent)]">
                        {coach.role}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--titan-muted)]">
                        {coach.bio}
                      </p>
                      <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70">
                        {coach.specialty}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Tarifs */}
        <section id="tarifs" className="border-t border-white/5 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="titan-section-label">Tarifs</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Choisissez votre niveau d&apos;engagement.
              </h2>
            </Reveal>

            <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <Reveal key={plan.name} delay={index * 0.08}>
                  <article
                    className={cn(
                      "relative flex h-full flex-col overflow-hidden rounded-3xl p-7",
                      plan.highlighted ? "titan-card-highlight titan-glow" : "titan-card",
                    )}
                  >
                    {plan.highlighted && (
                      <span className="absolute right-5 top-5 rounded-full bg-[var(--titan-accent)] px-3 py-1 text-xs font-bold uppercase text-[#050505]">
                        Populaire
                      </span>
                    )}
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="mt-2 text-sm text-[var(--titan-muted)]">
                      {plan.description}
                    </p>
                    <p className="mt-6 flex items-end gap-1">
                      <span className="text-5xl font-black">{plan.price}€</span>
                      <span className="mb-2 text-sm text-[var(--titan-muted)]">
                        / mois
                      </span>
                    </p>
                    <ul className="mt-8 flex-1 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-[var(--titan-accent)]" />
                          <span className="text-[var(--titan-muted)]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => handleNavigate("contact")}
                      className={cn(
                        "titan-btn mt-8 w-full",
                        plan.highlighted && "titan-btn-solid",
                      )}
                    >
                      Commencer
                    </button>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Tools: BMI + Goal Simulator */}
        <section className="border-t border-white/5 bg-[var(--titan-bg-elevated)] py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="titan-section-label">Outils</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Mesurez. Planifiez. Progressez.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <Reveal delay={0.05}>
                <div className="titan-card rounded-3xl p-7">
                  <h3 className="text-xl font-bold">Calculateur IMC</h3>
                  <p className="mt-2 text-sm text-[var(--titan-muted)]">
                    Entrez votre taille et poids pour obtenir votre indice de
                    masse corporelle.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--titan-muted-soft)]">
                        Taille (cm)
                      </span>
                      <input
                        type="number"
                        min={100}
                        max={250}
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="175"
                        className="titan-input"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--titan-muted-soft)]">
                        Poids (kg)
                      </span>
                      <input
                        type="number"
                        min={30}
                        max={250}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="72"
                        className="titan-input"
                      />
                    </label>
                  </div>
                  <div className="mt-6 rounded-2xl bg-white/5 p-5">
                    {bmi ? (
                      <>
                        <p className="text-sm text-[var(--titan-muted)]">Votre IMC</p>
                        <p className="mt-1 text-4xl font-black text-[var(--titan-accent)]">
                          {bmi.toFixed(1)}
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          {getBmiCategory(bmi)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[var(--titan-muted)]">
                        Renseignez vos mensurations pour voir votre IMC.
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="titan-card rounded-3xl p-7">
                  <h3 className="text-xl font-bold">Simulateur d&apos;objectif</h3>
                  <p className="mt-2 text-sm text-[var(--titan-muted)]">
                    Estimez le délai pour atteindre votre objectif selon votre
                    fréquence d&apos;entraînement.
                  </p>
                  <div className="mt-6 space-y-5">
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--titan-muted-soft)]">
                        Objectif
                      </span>
                      <select
                        value={goal}
                        onChange={(e) => setGoal(e.target.value as Goal)}
                        className="titan-input"
                      >
                        <option value="perte">Perte de poids</option>
                        <option value="muscle">Prise de muscle</option>
                        <option value="endurance">Endurance</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--titan-muted-soft)]">
                        Fréquence / semaine : {frequency} séances
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={6}
                        value={frequency}
                        onChange={(e) => setFrequency(Number(e.target.value))}
                        className="w-full accent-[var(--titan-accent)]"
                      />
                    </label>
                  </div>
                  <div className="mt-6 rounded-2xl bg-[var(--titan-accent-dim)] p-5">
                    <p className="text-sm text-[var(--titan-muted)]">
                      Estimation de résultat visible
                    </p>
                    <p className="mt-1 text-4xl font-black text-[var(--titan-accent)]">
                      ~{estimatedWeeks} semaines
                    </p>
                    <p className="mt-2 text-sm text-[var(--titan-muted)]">
                      Basé sur {frequency} séance{frequency > 1 ? "s" : ""} par
                      semaine avec suivi Titan.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.15} className="mt-12">
              <p className="titan-section-label">FAQ</p>
              <h3 className="mt-3 text-2xl font-bold md:text-3xl">
                Questions fréquentes
              </h3>
              <div className="mt-6">
                <FaqAccordion />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Transformations */}
        <section
          id="transformations"
          className="border-t border-white/5 py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <Reveal>
              <p className="titan-section-label">Transformations</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                Avant / Après — résultats réels.
              </h2>
            </Reveal>

            <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
              {transformations.map((item, index) => (
                <Reveal key={item.name} delay={index * 0.08}>
                  <article className="titan-card overflow-hidden rounded-3xl">
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={item.image}
                        alt={`Transformation de ${item.name}`}
                        fill
                        className="object-cover grayscale-[30%]"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-black/60 px-3 py-2 backdrop-blur-sm">
                          <p className="text-[10px] uppercase tracking-wider text-white/50">
                            Avant
                          </p>
                          <p className="text-sm font-bold">{item.before}</p>
                        </div>
                        <div className="rounded-xl bg-[var(--titan-accent)]/90 px-3 py-2 text-[#050505]">
                          <p className="text-[10px] uppercase tracking-wider opacity-70">
                            Après
                          </p>
                          <p className="text-sm font-bold">{item.after}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold">{item.name}</h3>
                        <span className="text-xs text-[var(--titan-muted)]">
                          {item.duration}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[var(--titan-accent)]">
                        {item.result}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--titan-muted)]">
                        &ldquo;{item.quote}&rdquo;
                      </p>
                      <div className="mt-4 flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="size-4 fill-[var(--titan-accent)] text-[var(--titan-accent)]"
                          />
                        ))}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Contact — Free trial form */}
        <section
          id="contact"
          className="border-t border-white/5 bg-[var(--titan-bg-elevated)] py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <Reveal>
                <p className="titan-section-label">Contact</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
                  Réservez votre essai gratuit.
                </h2>
                <p className="mt-4 max-w-md text-[var(--titan-muted)]">
                  7 jours d&apos;accès complet, sans engagement. Un coach vous
                  accueille dès votre première visite.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-[var(--titan-muted)]">
                  <li className="flex items-center gap-3">
                    <Check className="size-4 text-[var(--titan-accent)]" />
                    Accès à tous les équipements
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-4 text-[var(--titan-accent)]" />
                    Séance d&apos;évaluation offerte
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-4 text-[var(--titan-accent)]" />
                    Annulation en un clic
                  </li>
                </ul>
              </Reveal>

              <Reveal delay={0.1}>
                <form
                  onSubmit={handleTrialSubmit}
                  className="titan-card titan-glow rounded-3xl p-7"
                >
                  {formSent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-10 text-center"
                    >
                      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--titan-accent)] text-[#050505]">
                        <Check className="size-7" />
                      </div>
                      <h3 className="mt-5 text-xl font-bold">Demande envoyée !</h3>
                      <p className="mt-2 text-sm text-[var(--titan-muted)]">
                        Notre équipe vous contacte sous 24 h pour planifier votre
                        essai gratuit.
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold">Essai gratuit 7 jours</h3>
                      <div className="mt-6 space-y-4">
                        <label className="block">
                          <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--titan-muted-soft)]">
                            Nom complet
                          </span>
                          <input
                            required
                            type="text"
                            placeholder="Jean Dupont"
                            className="titan-input"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--titan-muted-soft)]">
                            Email
                          </span>
                          <input
                            required
                            type="email"
                            placeholder="jean@exemple.com"
                            className="titan-input"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--titan-muted-soft)]">
                            Téléphone
                          </span>
                          <input
                            required
                            type="tel"
                            placeholder="06 12 34 56 78"
                            className="titan-input"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-xs uppercase tracking-wider text-[var(--titan-muted-soft)]">
                            Objectif principal
                          </span>
                          <select required className="titan-input" defaultValue="">
                            <option value="" disabled>
                              Sélectionnez…
                            </option>
                            <option value="perte">Perte de poids</option>
                            <option value="muscle">Prise de muscle</option>
                            <option value="endurance">Endurance</option>
                            <option value="force">Force</option>
                          </select>
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="titan-btn titan-btn-solid mt-6 w-full"
                      >
                        Réserver mon essai
                        <ArrowRight className="size-4" />
                      </button>
                    </>
                  )}
                </form>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-5 py-10 md:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <DemoNotice variant="dark" />
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-[var(--titan-muted)] sm:flex-row">
            <p>© {new Date().getFullYear()} Titan Fitness · Démonstration conceptuelle</p>
            <button
              type="button"
              onClick={() => handleNavigate("accueil")}
              className="titan-nav-link"
            >
              Retour en haut
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
