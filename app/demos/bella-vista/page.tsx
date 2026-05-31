"use client";

import { useState, type FormEvent } from "react";
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
} from "lucide-react";
import { images } from "@/lib/demo-images";
import { cn, scrollToId } from "@/lib/utils";
import { Reveal } from "@/components/demos/reveal";
import { DemoNotice } from "@/components/demos/demo-notice";

const NAV = [
  { id: "accueil", label: "Accueil" },
  { id: "menu", label: "Menu" },
  { id: "a-propos", label: "À propos" },
  { id: "galerie", label: "Galerie" },
  { id: "reservation", label: "Réservation" },
  { id: "contact", label: "Contact" },
] as const;

const MENU_ITEMS = [
  {
    name: "Burrata des Pouilles",
    category: "Antipasti" as const,
    price: "18 €",
    desc: "Tomates confites, basilic frais, huile d'olive AOP.",
    image: images.bellaVista.dish1,
  },
  {
    name: "Carpaccio de bœuf",
    category: "Antipasti" as const,
    price: "22 €",
    desc: "Parmesan 24 mois, roquette, copeaux de truffe.",
    image: images.bellaVista.dish2,
  },
  {
    name: "Risotto au safran",
    category: "Primi" as const,
    price: "28 €",
    desc: "Émulsion de parmesan, zestes de citron.",
    image: images.bellaVista.dish3,
  },
  {
    name: "Tagliatelles al tartufo",
    category: "Primi" as const,
    price: "34 €",
    desc: "Truffe noire d'hiver, beurre monté.",
    image: images.bellaVista.dish4,
  },
  {
    name: "Panna cotta vanille",
    category: "Dolci" as const,
    price: "12 €",
    desc: "Compote de fruits rouges maison.",
    image: images.bellaVista.dish5,
  },
  {
    name: "Tiramisu classique",
    category: "Dolci" as const,
    price: "14 €",
    desc: "Mascarpone, espresso, cacao amer.",
    image: images.bellaVista.dish6,
  },
];

const TESTIMONIALS = [
  {
    name: "Camille R.",
    text: "Une expérience rare : service discret, assiettes d'une précision chirurgicale. Le risotto au safran restera gravé.",
    rating: 5,
  },
  {
    name: "Marc D.",
    text: "L'ambiance feutrée et la cave italienne impressionnent. On se croirait à Milan, sans quitter Paris.",
    rating: 5,
  },
  {
    name: "Élise M.",
    text: "Réservation fluide, accueil chaleureux. Chaque plat raconte une histoire — c'est de la haute gastronomie italienne.",
    rating: 5,
  },
];

const TIME_SLOTS = ["12:00", "12:30", "13:00", "19:30", "20:00", "20:30", "21:00"];

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
      className="text-sm tracking-wide text-[var(--bella-muted)] transition-colors hover:text-[var(--bella-cream)]"
    >
      {label}
    </button>
  );
}

export default function BellaVistaPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");

  function handleReserve(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitState === "loading") return;
    setSubmitState("loading");
    window.setTimeout(() => setSubmitState("success"), 1200);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0908] text-[#f5f0e8]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#c9a962]/10 bg-[#0a0908]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-18 sm:px-6">
          <button
            type="button"
            onClick={() => scrollToId("accueil")}
            className="bella-display text-xl tracking-[0.12em] text-[#f5f0e8] sm:text-2xl"
          >
            Bella Vista
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
            {NAV.map((item) => (
              <NavLink key={item.id} id={item.id} label={item.label} />
            ))}
          </nav>

          <button
            type="button"
            className="bella-btn hidden text-xs md:inline-flex"
            onClick={() => scrollToId("reservation")}
          >
            Réserver
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>

          <button
            type="button"
            className="rounded-full border border-[#c9a962]/25 p-2 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-[#c9a962]/10 md:hidden"
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
                  className="bella-btn mt-2 w-full"
                  onClick={() => {
                    scrollToId("reservation");
                    setMenuOpen(false);
                  }}
                >
                  Réserver une table
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section
          id="accueil"
          className="relative flex min-h-[100svh] items-end justify-center"
        >
          <Image
            src={images.bellaVista.hero}
            alt="Salle du restaurant Bella Vista"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-[#0a0908]/55 to-[#0a0908]/25" />
          <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-32 text-center sm:px-6 sm:pb-28">
            <Reveal>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-[#c9a962]">
                Paris 8ᵉ · Gastronomie italienne
              </p>
              <h1 className="bella-display text-4xl leading-tight sm:text-6xl md:text-7xl">
                L&apos;art de la table
                <span className="block text-[#c9a962]">à l&apos;italienne</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-[var(--bella-muted)] sm:text-base">
                Cuisine d&apos;auteur inspirée des traditions du Nord et du Sud.
                Une étoile au Guide Michelin · 48 couverts par service.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  type="button"
                  className="bella-btn"
                  onClick={() => scrollToId("reservation")}
                >
                  Réserver une table
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  className="text-sm tracking-wide text-[var(--bella-muted)] underline-offset-4 hover:text-[#f5f0e8] hover:underline"
                  onClick={() => scrollToId("menu")}
                >
                  Découvrir la carte
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="menu" className="border-t border-[#c9a962]/10 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c9a962]">La carte</p>
              <h2 className="bella-display mt-3 text-3xl sm:text-5xl">Menu de saison</h2>
              <p className="mx-auto mt-4 max-w-lg text-sm text-[var(--bella-muted)]">
                Produits sourcés en Italie et en Île-de-France. Carte renouvelée chaque trimestre.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {MENU_ITEMS.map((item, i) => (
                <Reveal key={item.name} delay={i * 0.06}>
                  <article className="bella-card group overflow-hidden rounded-2xl">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <span className="absolute left-3 top-3 rounded-full border border-[#c9a962]/30 bg-[#0a0908]/70 px-3 py-1 text-[10px] uppercase tracking-widest text-[#c9a962]">
                        {item.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="bella-display text-xl">{item.name}</h3>
                        <span className="shrink-0 text-sm font-medium text-[#c9a962]">
                          {item.price}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--bella-muted)]">
                        {item.desc}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="a-propos" className="border-t border-[#c9a962]/10 py-20 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image
                  src={images.bellaVista.chef}
                  alt="Chef Alessandro Moretti"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908]/80 to-transparent" />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-xs uppercase tracking-[0.3em] text-[#c9a962]">Le chef</p>
              <h2 className="bella-display mt-3 text-3xl sm:text-5xl">Alessandro Moretti</h2>
              <p className="mt-6 text-sm leading-relaxed text-[var(--bella-muted)] sm:text-base">
                Formé à Modène et à Paris, Alessandro sublime les recettes familiales de sa
                grand-mère piémontaise avec une technique contemporaine. Chaque service est une
                conversation entre terroir italien et saison parisienne.
              </p>
              <ul className="mt-10 grid grid-cols-3 gap-4">
                {[
                  { value: "15 ans", label: "d'expérience" },
                  { value: "1 étoile", label: "Michelin" },
                  { value: "48", label: "couverts" },
                ].map((stat) => (
                  <li key={stat.label} className="bella-card rounded-xl p-4 text-center">
                    <span className="bella-display block text-2xl text-[#c9a962] sm:text-3xl">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-xs text-[var(--bella-muted)]">
                      {stat.label}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section id="galerie" className="border-t border-[#c9a962]/10 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mb-12 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c9a962]">Ambiance</p>
              <h2 className="bella-display mt-3 text-3xl sm:text-5xl">Galerie</h2>
            </Reveal>
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.bellaVista.gallery.map((src, i) => (
                <Reveal key={`gallery-${i}`} delay={i * 0.05}>
                  <div className="group relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={src}
                      alt={`Galerie Bella Vista ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-[#0a0908]/0 transition-colors duration-500 group-hover:bg-[#0a0908]/20" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[#c9a962]/10 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c9a962]">Témoignages</p>
              <h2 className="bella-display mt-3 text-3xl sm:text-5xl">Ils en parlent</h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.08}>
                  <blockquote className="bella-card flex h-full flex-col rounded-2xl p-6">
                    <div className="flex gap-0.5 text-[#c9a962]" aria-label={`${t.rating} étoiles`}>
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--bella-muted)]">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <footer className="mt-5 text-sm font-medium">{t.name}</footer>
                  </blockquote>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="reservation" className="border-t border-[#c9a962]/10 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.3em] text-[#c9a962]">Réservation</p>
                <h2 className="bella-display mt-3 text-3xl sm:text-5xl">Votre table vous attend</h2>
                <p className="mt-4 text-sm leading-relaxed text-[var(--bella-muted)]">
                  Déjeuner du mardi au samedi · Dîner du mardi au dimanche. Confirmation sous 2 h
                  ouvrées.
                </p>
                <div className="relative mt-8 hidden aspect-video overflow-hidden rounded-2xl lg:block">
                  <Image
                    src={images.bellaVista.interior}
                    alt="Intérieur du restaurant"
                    fill
                    className="object-cover"
                    sizes="50vw"
                  />
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                {submitState === "success" ? (
                  <div className="bella-card rounded-2xl p-8 text-center">
                    <p className="bella-display text-2xl text-[#c9a962]">Merci !</p>
                    <p className="mt-4 text-sm text-[var(--bella-muted)]">
                      Votre demande a bien été enregistrée. Notre équipe vous contactera très
                      prochainement pour confirmer votre réservation.
                    </p>
                    <button
                      type="button"
                      className="bella-btn mt-8"
                      onClick={() => setSubmitState("idle")}
                    >
                      Nouvelle réservation
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleReserve}
                    className="bella-card space-y-5 rounded-2xl p-6 sm:p-8"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="block text-sm">
                        <span className="mb-2 block text-[var(--bella-muted)]">Date</span>
                        <input
                          type="date"
                          name="date"
                          required
                          className="w-full rounded-lg border border-[#c9a962]/20 bg-[#0a0908] px-4 py-3 text-sm outline-none focus:border-[#c9a962]/50"
                        />
                      </label>
                      <label className="block text-sm">
                        <span className="mb-2 block text-[var(--bella-muted)]">Heure</span>
                        <select
                          name="time"
                          required
                          defaultValue=""
                          className="w-full rounded-lg border border-[#c9a962]/20 bg-[#0a0908] px-4 py-3 text-sm outline-none focus:border-[#c9a962]/50"
                        >
                          <option value="" disabled>
                            Choisir
                          </option>
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="block text-sm">
                      <span className="mb-2 block text-[var(--bella-muted)]">Nombre de convives</span>
                      <select
                        name="guests"
                        required
                        defaultValue="2"
                        className="w-full rounded-lg border border-[#c9a962]/20 bg-[#0a0908] px-4 py-3 text-sm outline-none focus:border-[#c9a962]/50"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "personne" : "personnes"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm">
                      <span className="mb-2 block text-[var(--bella-muted)]">Nom complet</span>
                      <input
                        type="text"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Jean Dupont"
                        className="w-full rounded-lg border border-[#c9a962]/20 bg-[#0a0908] px-4 py-3 text-sm outline-none focus:border-[#c9a962]/50"
                      />
                    </label>
                    <label className="block text-sm">
                      <span className="mb-2 block text-[var(--bella-muted)]">Téléphone</span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        autoComplete="tel"
                        placeholder="06 12 34 56 78"
                        className="w-full rounded-lg border border-[#c9a962]/20 bg-[#0a0908] px-4 py-3 text-sm outline-none focus:border-[#c9a962]/50"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={submitState === "loading"}
                      className={cn(
                        "bella-btn w-full",
                        submitState === "loading" && "pointer-events-none opacity-70"
                      )}
                    >
                      {submitState === "loading" ? "Envoi en cours…" : "Confirmer la demande"}
                    </button>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-[#c9a962]/10 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal className="mb-12 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-[#c9a962]">Nous trouver</p>
              <h2 className="bella-display mt-3 text-3xl sm:text-5xl">Contact</h2>
            </Reveal>
            <div className="grid gap-8 lg:grid-cols-2">
              <Reveal>
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src={images.bellaVista.map}
                    alt="Carte — Paris 8e, avenue Montaigne"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-[#0a0908]/50" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <MapPin className="h-10 w-10 text-[#c9a962]" aria-hidden />
                    <p className="mt-4 text-sm font-medium">24 avenue Montaigne</p>
                    <p className="text-sm text-[var(--bella-muted)]">75008 Paris</p>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.1} className="space-y-6">
                <div className="bella-card rounded-2xl p-6">
                  <h3 className="bella-display text-xl">Adresse & horaires</h3>
                  <ul className="mt-4 space-y-4 text-sm text-[var(--bella-muted)]">
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a962]" aria-hidden />
                      <span>24 avenue Montaigne, 75008 Paris</span>
                    </li>
                    <li className="flex gap-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a962]" aria-hidden />
                      <span>
                        Mar–Sam 12h–14h30 · 19h30–22h30
                        <br />
                        Dim soir uniquement · Fermé lundi
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="bella-card rounded-2xl p-6">
                  <h3 className="bella-display text-xl">Coordonnées</h3>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li>
                      <a
                        href="tel:+33142680000"
                        className="flex items-center gap-3 text-[var(--bella-muted)] transition-colors hover:text-[#f5f0e8]"
                      >
                        <Phone className="h-4 w-4 text-[#c9a962]" aria-hidden />
                        01 42 68 00 00
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:contact@bellavista.fr"
                        className="flex items-center gap-3 text-[var(--bella-muted)] transition-colors hover:text-[#f5f0e8]"
                      >
                        <Mail className="h-4 w-4 text-[#c9a962]" aria-hidden />
                        contact@bellavista.fr
                      </a>
                    </li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#c9a962]/10 py-10">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
          <DemoNotice variant="gold" />
          <div className="flex flex-col items-center justify-between gap-4 text-center text-xs text-[var(--bella-muted)] sm:flex-row sm:text-left">
            <span className="bella-display tracking-widest text-[#f5f0e8]">Bella Vista</span>
            <p>© {new Date().getFullYear()} · Démonstration conceptuelle — Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
