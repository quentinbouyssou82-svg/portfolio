# Prompt — Palan Capital × style Apex Advisory (law-shelf)

> **Usage :** copier le bloc ci-dessous dans une nouvelle conversation Cursor (ou autre IA) pour implémenter la homepage Palan Capital en reprenant **exactement** le design system du prototype `apex-advisory`, avec les textes FR Palan Capital.

**Référence visuelle obligatoire :**  
`http://localhost:3000/demos/apex-advisory?hero=law-shelf`

**Code source du style :**  
`app/demos/apex-advisory/` · `components/apex-advisory/` · `app/demos/apex-advisory/apex-advisory.css`

**Contenu FR :**  
`lib/palan-capital/content.ts` (source de vérité textes)

**Cible :**  
`/demos/palan-capital` — **1 page** landing, **front-end only**, **sans backend**

---

## BLOC À COPIER-COLLER

```
# MISSION

Implémente la homepage **Palan Capital** en reprenant **à l'identique** le design system, la structure de sections, les animations et le rendu visuel du prototype **Apex Advisory** (demo existante dans le repo).

**Référence visuelle :** http://localhost:3000/demos/apex-advisory?hero=law-shelf

**Hero image :** utiliser l'image `law-shelf` (rayon de livres de droit — Unsplash `photo-1752697589000-9819ed4fc30c`, object-position `72% 40%`) avec les mêmes scrims, mesh, orbs, beam, vignette que Apex.

**Projet client :** Palan Capital (pas Apex Advisory)
**Langue :** français uniquement
**Textes :** mot pour mot depuis `lib/palan-capital/content.ts` — ne pas réécrire le copywriting
**Périmètre :** 1 page scroll (landing), pas d'autres routes, pas de backend, pas de formulaire fonctionnel
**Cible route :** `/demos/palan-capital`

Tu peux copier/adapter les composants CSS et la structure depuis `apex-advisory`, puis remplacer uniquement les textes et la marque. Le rendu doit être **visuellement indiscernable** d'Apex (même ADN), seul le contenu change.

---

# DESIGN SYSTEM À REPRODUIRE (Apex Advisory)

## Direction
**Modern quiet luxury** — obsidian & champagne. Fond noir profond, typo ivory, accents champagne métallique. Institutionnel, discret, premium. PAS fintech néon.

## Palette (CSS variables — garder les mêmes tokens `ax-*`)
- Background : `#030304` (--ax-bg), soft `#080809`, elevated `#0e0e10`
- Texte : `#f5f2ec` (primary), `#b8b2a8` (secondary), `#6e6a64` (muted)
- Champagne : gradient `#f4ede4` → `#d4c4a8` → `#9a8668`
- Bordures : `rgba(255,255,255,0.08)`
- Easing : `cubic-bezier(0.22, 1, 0.36, 1)`

## Typographie
- **Display :** Cormorant Garamond (300–600, italic pour accents gold)
- **Sans :** Manrope (300–600)
- Labels : uppercase, letter-spacing large (0.22–0.34em), petite taille
- Headlines : clamp responsive, font-weight 300, line-height serré

## Composants UI (classes `ax-*` — reprendre le CSS tel quel)
- Nav fixe transparente → fond obsidian au scroll, pill links, CTA pill
- Scroll progress bar gold en haut
- Hero full-viewport : photo + scrim diagonal + mesh grid + gradient orbs + beam vertical
- Badge pill avec dot pulsant
- Headline reveal animation (mots qui montent en cascade)
- Hero panel glass (carte droite desktop) avec grille 2×2
- Marquee infini sous le hero
- Sections avec watermark géant (01, 02, 03), divider gradient
- Services : sticky title gauche + stack de cards droite (hover shine, watermark numéro)
- Approach : timeline verticale avec dots gold
- Credibility : bento stats (à adapter — voir mapping)
- CTA : frame border + glow radial + boutons gold/ghost
- Footer minimal dark
- Scroll reveal IntersectionObserver
- `prefers-reduced-motion` respecté

## Animations
- ax-rise, ax-shimmer sur gold text, ax-marquee, ax-photo-settle, ax-beam, ax-scroll-line/bob
- Cards hover : translateY + border gold + shine sweep
- Boutons : translateY(-2px) + glow

## Hero photo law-shelf
Image : books about law on shelf (Krists Luhaers / Unsplash)
Même traitement que `apex-hero.tsx` : cover, scrim 105deg obsidian, tint champagne soft-light

---

# STRUCTURE PAGE (même ordre qu'Apex)

1. ScrollProgress
2. Nav (ancres scroll vers sections)
3. Hero + Marquee
4. Section « Services » → **Expertises Palan** (id: expertises)
5. Section « Approach » → **Convictions Palan** (id: convictions)
6. Section « Credibility » → **Audiences Palan** (id: audiences)
7. Section CTA → **Contact** (id: contact)
8. Footer

Nav links FR suggérés : Expertises · Convictions · Audiences · Contact

---

# MAPPING CONTENU — APEX → PALAN CAPITAL (FR)

## NAV
- Logo : **Palan** + **Capital** (Capital en gold gradient comme "Advisory")
- CTA nav : **Contact** ou **Entretien**

## HERO

| Apex (EN) | Palan Capital (FR) |
|-----------|-------------------|
| Badge : Independent advisory · Geneva · London | **Cabinet d'ingénierie financière indépendant** |
| H1 : Capital architecture / for the exceptional | **Créer du levier.** / **Révéler la valeur.** (deuxième ligne en italic gold gradient) |
| Body | Combiner les 3 lignes sous-titre : Financement d'actifs · LLD · dette privée — Fiducie-sûreté · structuration patrimoniale · levée de fonds — France · Luxembourg · Émirats Arabes Unis |
| CTA primary | **Demander un entretien** → scroll #contact |
| CTA ghost | **Nos expertises** → scroll #expertises |

**Hero panel (desktop, remplace les stats fictives Apex) :**
Titre label : **En un coup d'œil** ou **Juridictions**
Grille 2×2 avec les 3 juridictions Palan (+ 1 case récap) :

| Valeur | Label |
|--------|-------|
| France | Juridiction principale — Courtage · IOBSP · CIF |
| Luxembourg | Véhicules d'investissement |
| Émirats | Structuration internationale |
| 4 pôles | Expertise intégrée |

Footer panel : *Cabinet indépendant — structuration avant financement. France · Luxembourg · Émirats.*

## MARQUEE (items FR, séparateur ◆)
France · Luxembourg · Émirats Arabes Unis · Dette privée · Structuration patrimoniale · Levée de fonds · Dirigeants · Patrimoines privés · Fonds · Investisseurs qualifiés

## SECTION EXPERTISES (remplace Services)

- Watermark : **01**
- Label : **Nos expertises**
- H2 : **Quatre pôles,** *un capital maîtrisé.* (partie italic en gold)
- Intro body : Nous intervenons à chaque strate de la structure financière — de la trésorerie dormante aux actifs tangibles, de la dette privée à la levée de fonds. Une approche intégrée et sur mesure.

**4 cards (pas 5) :**

| # | Titre | EN subtitle (petit label) | Description | Tags en badges |
|---|-------|---------------------------|-------------|--------------|
| 01 | Financement & LLD | Debt Solutions | Refinancement d'actifs tangibles et solutions de location longue durée. Vos actifs mobilisés, votre trésorerie préservée. | Immobilier pro · Véhicules · Yachts & Jets · LLD · LOA |
| 02 | Dette privée | Private Yield | Accès à des produits de dette privée sélectionnés. Transformer la trésorerie en levier de marge, sans impact sur l'exploitation. | Obligations structurées · Dette mezzanine · Durées maîtrisées · Sûretés négociées |
| 03 | Structuration patrimoniale | Wealth Engineering | Architecture juridique multi-juridictionnelle. Holdings, fiducie-sûreté, refinancement de participations, transmission. | Fiducie-sûreté · Holdings patrimoniales · Transmission · Cross-border |
| 04 | Levée de fonds | Capital Raising | Accompagnement à la levée equity et obligataire. Conception de véhicules, rédaction de memos d'investissement, sourcing d'investisseurs qualifiés. | Equity · Obligataire · Memos IC · Co-investissements |

## SECTION CONVICTIONS (remplace Approach / Methodology)

- Watermark : **02**
- Label : **Notre approche**
- H2 : **Trois convictions guident** *chacune de nos missions.*
- Intro : Les opérations que nous conduisons partagent toutes la même logique : identifier où se crée réellement la valeur, structurer les instruments qui permettent de la capter, aligner les intérêts dans la durée.

**Timeline 3 steps :**

| # | Titre | Texte |
|---|-------|-------|
| 01 | Structurer avant de financer | [texte complet content.ts convictions item 01] |
| 02 | Révéler la valeur sous-jacente | [texte complet] |
| 03 | Aligner les intérêts dans la durée | [texte complet] |

## SECTION AUDIENCES (remplace Credibility / stats fictives)

⚠️ Palan n'a PAS de chiffres inventés (pas de €2.4B). Remplacer le bento stats par **4 cartes audiences** en grille bento (2×2 ou layout featured similaire).

- Watermark : **03**
- Label : **À qui nous nous adressons**
- H2 : **À chaque audience,** *son langage.*

**4 cartes cliquables (href="#" décoratif) :**

| # | Titre | Texte court |
|---|-------|-------------|
| 01 | Conseil aux dirigeants | Création de levier financier, révélation d'actifs dormants, préparation de cession ou de transmission... |
| 02 | Patrimoines privés | Structuration internationale, holdings patrimoniales, optimisation de liquidités dormantes, transmission... |
| 03 | Conseil aux fonds | Optimisation pré-cession de participations, préparation d'investissement equity, structuration de deals complexes... |
| 04 | Investisseurs | Opportunités propriétaires en dette privée, obligations structurées, co-investissements equity... |

**Quote block (sous les cartes) :**
*Chaque mission commence par un entretien de cadrage. Confidentiel, sans engagement.*

## SECTION CTA / CONTACT

- Label : **Contact**
- H2 : **Une question,** *un dossier,* **une opportunité.**
- Body : Chaque mission commence par un entretien de cadrage. Nous évaluons la faisabilité et la pertinence avant toute proposition chiffrée. Entretiens confidentiels, sans engagement.
- CTA gold : **Demander un entretien** (bouton décoratif ou mailto:contact@palancapital.com)
- CTA ghost : **contact@palancapital.com** ou siège **2 rue d'Austerlitz · 31000 Toulouse**

## FOOTER

Palan Capital — Cabinet indépendant d'ingénierie financière et de structuration patrimoniale. France · Luxembourg · Émirats Arabes Unis.

SAS LIVING · SIREN 983 940 958 · RCS Toulouse · ORIAS IOBSP 2021 · CIF en cours

© 2026 Palan Capital

---

# CONTRAINTES TECHNIQUES

- Next.js 16 + React 19 + Tailwind 4 (comme le repo portfolio)
- Réutiliser ou dupliquer `apex-advisory.css` → `palan-capital.css` (mêmes classes `ax-*` ou préfixe `pc-ax-*` si tu préfères, mais même rendu)
- Fonts : Cormorant Garamond + Manrope via next/font
- GSAP / Lenis si utilisé dans ApexMotionProvider — reprendre le même smooth scroll
- Responsive : mobile-first, hero panel caché sur mobile (comme Apex)
- Pas de hero image picker en prod (picker dev optionnel)
- `robots: noindex` sur la demo
- Ne pas modifier les textes FR

---

# CE QU'IL NE FAUT PAS FAIRE

- Ne pas inventer de chiffres (AUM, clients, années) — Palan n'en a pas sur le brief
- Ne pas afficher logos partenaires (Décathlon, etc.)
- Ne pas reprendre le site navy/gold Netlify original — c'est le style **Apex obsidian/champagne** qui fait foi
- Ne pas réécrire les textes
- Ne pas ajouter de backend

---

# LIVRABLE

1. `app/demos/palan-capital/` — layout, page, CSS
2. `components/palan-capital/` — composants miroir d'apex-advisory avec contenu FR
3. Build qui passe (`npm run build`)
4. Visuellement aligné sur `apex-advisory?hero=law-shelf`

Commence par dupliquer la structure Apex, remplace la marque et les textes, vérifie côte à côte avec la référence.
```
