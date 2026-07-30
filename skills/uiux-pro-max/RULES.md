# UI/UX Pro Max — Règles dures (agents)

À appliquer **avant** d’écrire du UI. Priorité 1 → 10.

**Arbitrage Driveely / repo :** si un design system, des tokens CSS ou des composants existent déjà → **les suivre**. Pro Max = guidance ; le DS produit gagne en cas de conflit d’esthétique.

---

## 0. Méta-règles agent

1. **Invoker le skill** quand l’UI change (look / feel / motion / interaction).
2. **Nouveau produit / page sans DS** → commencer par `--design-system` (CLI source).
3. **Pas d’emoji** comme icônes structurelles (nav, settings, contrôles) → SVG (Lucide, Phosphor, Heroicons).
4. **Cohérence de style** sur tout le produit ; ne pas mixer flat + skeuomorphic au hasard.
5. **Une CTA primaire** par écran ; le secondaire est visuellement subordonné.
6. **Tokens sémantiques** (primary, surface, destructive…) — pas de hex bruts éparpillés dans les composants.
7. Respecter **platform idioms** (iOS HIG vs Material) sur mobile / native.
8. Ne pas bloquer les gestes système (swipe-back, Control Center, etc.).

---

## 1. Accessibility — CRITICAL

| Règle | Standard |
|-------|----------|
| Contraste texte | ≥ 4.5:1 (texte normal) ; ≥ 3:1 (grand texte) |
| Focus visible | Anneaux 2–4px ; ne jamais supprimer les focus rings |
| Alt text | Images significatives |
| aria-label | Boutons icon-only ; `accessibilityLabel` en native |
| Clavier | Ordre tab = ordre visuel ; support complet |
| Labels formulaire | `<label for>` / labels visibles (pas placeholder seul) |
| Skip links | Lien « aller au contenu » |
| Titres | Hiérarchie h1→h6 sans saut de niveau |
| Couleur seule | Jamais seule pour transmettre l’info (+ icône / texte) |
| Dynamic Type | Supporter le scaling système ; éviter la troncature |
| Reduced motion | Respecter `prefers-reduced-motion` |
| Escape | Cancel / back dans modals et flows multi-étapes |

---

## 2. Touch & Interaction — CRITICAL

| Règle | Standard |
|-------|----------|
| Taille cible | ≥ 44×44pt (Apple) / ≥ 48×48dp (Material) ; étendre hit area si besoin |
| Espacement cibles | ≥ 8px / 8dp |
| Hover seul | Interdit pour actions critiques — click/tap primaire |
| Loading boutons | Disable + spinner pendant async |
| Feedback press | Ripple / highlight / opacity sous ~100–150ms |
| Gestes | Standards plateforme ; alternative visible aux gestes seuls |
| Safe areas | Pas de CTA sous notch / Dynamic Island / home indicator |
| Drag | Seuil de mouvement avant démarrage |

---

## 3. Performance — HIGH

- Images WebP/AVIF, `srcset`, lazy hors hero
- Réserver largeur/hauteur ou `aspect-ratio` (CLS &lt; 0.1)
- `font-display: swap` / optional ; preload fonts critiques seulement
- Split routes / dynamic import hors fold
- Virtualiser listes ≥ 50 items
- Budget frame ~16ms ; debounce/throttle scroll/resize/input
- Skeletons si chargement &gt; ~300ms–1s (pas spinner bloquant long)
- Latence input &lt; ~100ms

---

## 4. Style Selection — HIGH

- Matcher le style au **type de produit** (`--design-system` / `--domain product|style`)
- Effets (blur, shadow, radius) alignés au style choisi
- Une famille d’icônes + stroke cohérent
- Dark/light conçus **ensemble** (pas d’inversion naïve)
- Élévation / ombres sur une échelle stable
- Blur pour indiquer le fond dismissé (modal/sheet), pas décoration gratuite
- Préférer contrôles natifs sauf besoin brand fort

---

## 5. Layout & Responsive — HIGH

- Mobile-first ; viewport `width=device-width, initial-scale=1` (**ne jamais disable zoom**)
- Breakpoints systématiques (ex. 375 / 768 / 1024 / 1440)
- Body ≥ 16px mobile (évite zoom iOS)
- Pas de scroll horizontal mobile
- Spacing 4/8pt
- `min-h-dvh` plutôt que `100vh` mobile
- Contenu fixe (nav/bottom) → padding de compensation
- Contenu core d’abord sur mobile

---

## 6. Typography & Color — MEDIUM

- Line-height body ~1.5–1.75 ; mesure ~65–75 car. desktop, 35–60 mobile
- Échelle typo cohérente (ex. 12/14/16/18/24/32)
- Poids : headings 600–700, body 400, labels 500
- Dark mode : variantes tonales désaturées / plus claires, **pas** inversion
- Chiffres tabulaires pour data / prix / timers
- Truncation : préférer wrap ; sinon ellipsis + accès au texte complet

---

## 7. Animation — MEDIUM

- Micro-interactions **150–300ms** ; complexes ≤ 400ms ; éviter &gt; 500ms
- Animer **transform / opacity** seulement (pas width/height/top/left)
- Max 1–2 éléments animés marquants par vue
- ease-out entrée, ease-in sortie ; exit ~60–70% de l’entrée
- Motion = cause → effet (pas décoratif seul)
- Interruptible ; ne jamais bloquer l’input pendant l’anim
- Stagger listes 30–50ms / item
- Respecter reduced-motion

---

## 8. Forms & Feedback — MEDIUM

- Labels visibles ; helper text persistant si besoin
- Erreurs **sous le champ** + cause + correction ; focus premier champ invalide
- Validation on blur (pas à chaque keystroke)
- Required marqués ; confirmation avant destructif
- Empty states utiles + action
- Toasts 3–5s, `aria-live="polite"`, ne pas voler le focus
- Undo pour actions destructives / bulk
- Sheets : confirmer dismiss si unsaved
- Inputs mobiles hauteur ≥ 44px ; types sémantiques (`email`, `tel`…)

---

## 9. Navigation — HIGH

- Bottom nav ≤ 5 items ; icône **+** label
- Back prévisible ; préserver scroll / filtres / state
- Deep links sur écrans clés
- Ne pas mixer Tab + Sidebar + Bottom au même niveau
- Modals ≠ navigation primaire
- Large screen (≥1024) : sidebar ; small : bottom/top
- Actions dangereuses (logout, delete) séparées du nav courant
- Focus vers main content après changement de route (SR)

---

## 10. Charts & Data — LOW

- Type adapté (trend→line, compare→bar, proportion→pie ≤5 cats)
- Pas couleur seule ; patterns / textures / labels
- Légende visible ; tooltips hover **et** keyboard / tap
- Alternative table pour a11y ; résumé texte / aria-label
- Empty + loading + error states explicites
- Contraste data ≥ 3:1 vs fond ; labels ≥ 4.5:1

---

## Règles « look pro » (App — iOS / Android / RN / Flutter)

Extraites du skill ; scope **app**, pas patterns desktop-web purs :

- Icônes vectorielles thématisables ; tailles en tokens ; filled vs outline par niveau
- États press sans décalage de layout
- Logos officiels uniquement
- Contraste light **et** dark testés séparément
- Scrim modal ~40–60% noir
- Safe areas + insets scroll sous barres fixes
- Rythme 4/8dp partout

---

## Interdits fréquents

- Focus rings retirés  
- Hover-only pour action critique  
- Transitions 0ms ou &gt;500ms décoratives  
- Emoji en icônes système  
- Placeholder comme seul label  
- Zoom désactivé  
- Scroll horizontal mobile  
- Pie &gt; 5 catégories  
- Hex hardcodés hors tokens  
- Contenu sous notch / home indicator  
- Animation width/height causant CLS  
- Reset silencieux du back stack
