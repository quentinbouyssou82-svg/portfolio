# Margeo

**Le copilote IA des livreurs indépendants.** Capture une proposition de course (Uber Eats, Deliveroo, Shopopop, Stuart, Amazon Flex), dépose-la dans Margeo, et sache en 2 secondes si elle est vraiment rentable.

> MVP de démonstration : l'OCR et l'IA sont simulés par un moteur de règles déterministe (`lib/engine.ts`) et des données fictives (`lib/data.ts`), afin de se concentrer sur l'expérience produit.

## Accès

- **Dans le portfolio** : [http://localhost:3000/demos/margeo](http://localhost:3000/demos/margeo) (`npm run dev` à la racine)
- **Projet standalone** : ce dossier `margeo/` peut aussi être déployé seul sur Vercel

## Stack

- **Next.js 15** (App Router) · React 19 · TypeScript strict
- **Tailwind CSS v4** — design system dark-only via tokens `@theme`
- **Framer Motion** — animations au scroll, compteurs, progress rings
- **shadcn/ui-style components** — écrits à la main, zéro dépendance Radix
- **Lucide Icons** · **Geist** (Vercel Fonts) · **Sonner** (toasts)

## Démarrer

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

Aucune variable d'environnement n'est requise : toutes les données sont simulées côté client.

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page (hero, fonctionnement, fonctionnalités, captures, FAQ, CTA) |
| `/dashboard` | Gains du jour, rentabilité moyenne, objectif, graphique d'évolution |
| `/analyse` | Upload de capture → scan animé → verdict complet |
| `/historique` | Liste filtrable des analyses |
| `/historique/[id]` | Détail d'une analyse |
| `/profil` | Véhicule, coût/km, objectifs, préférences |
| `/premium` | Comparatif Gratuit vs Premium + essai |

## Architecture

```
app/            Pages (App Router). Le groupe (app) partage le shell connecté.
components/     Composants réutilisables (ui/, landing/, analyse/)
lib/            Faux backend : types, moteur d'analyse, données de démo
hooks/          Hooks partagés
```

Le cœur du produit est `lib/engine.ts` : il calcule coût réel (distance + retour à vide + temps), gain net, taux horaire, score 0–100 et génère la recommandation rédigée. Remplacer le faux OCR par un vrai pipeline (vision + LLM) ne demande que de produire un `RideOffer` — tout le reste suit.

## Déploiement

Compatible Vercel sans configuration : importer le dossier `margeo` comme racine du projet, framework Next.js détecté automatiquement.
