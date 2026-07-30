# Checklist landing — Vercel Web Interface Guidelines

**Obligatoire avant ship d’une landing / page marketing.**

Sources : https://vercel.com/design/guidelines · [SUMMARY.md](./SUMMARY.md)

### Mode d’emploi

- Cocher `[x]` si vérifié et conforme.
- Laisser `[ ]` + noter le finding (`fichier:ligne` ou description visuelle).
- Marquer `N/A — raison` si l’élément n’existe pas sur la page (ex. pas de formulaire).
- **Bloquants typiques :** zoom désactivé, focus invisible, contraste insuffisant, liens non `<a>`, images sans dimensions (CLS), `prefers-reduced-motion` ignoré, skip/headings absents.

Si [`../uiux-pro-max/`](../uiux-pro-max/) s’applique : cocher **aussi** sa checklist. Design system repo > esthétique inventée.

---

## 0. Méta audit

- [ ] URL / chemin de la page auditées notés
- [ ] Viewport testés : mobile (~375), laptop (~1280), ultra-wide (ou zoom 50 %)
- [ ] Thème clair **et** sombre testés si les deux existent
- [ ] Rapport : compte PASS / FAIL / N/A + liste des FAIL

---

## 1. Accessibilité & structure

- [ ] Un seul `<h1>` descriptif ; hiérarchie `h1`–`h6` sans saut illogique
- [ ] Lien « Skip to content » présent et fonctionnel au clavier
- [ ] Landmarks sémantiques (`header`, `main`, `nav`, `footer`) utilisés
- [ ] Sémantique native avant ARIA (`button`, `a`, `label`…)
- [ ] Boutons icon-only : `aria-label` descriptif
- [ ] Icônes décoratives : `aria-hidden="true"`
- [ ] Images : `alt` significatif **ou** `alt=""` si purement décoratives
- [ ] Statuts / badges : pas de sens porté par la couleur seule (texte ou icône+texte)
- [ ] Contenu annoncé async (toasts, validation) : `aria-live="polite"` — ou N/A
- [ ] Ancres de section : `scroll-margin-top` sur titres ciblés

---

## 2. Clavier & focus

- [ ] Tout flux interactif (nav, CTA, modale, menu) opérable au clavier seul
- [ ] Focus visible sur chaque contrôle interactif (`:focus-visible` ou équivalent)
- [ ] Pas de `outline: none` / `outline-none` **sans** remplacement de focus
- [ ] Groupes de contrôles : `:focus-within` si pertinent
- [ ] Modale / drawer / menu : trap focus + retour focus à la fermeture (patterns APG) — ou N/A
- [ ] Ordre de tabulation = ordre de lecture / source

---

## 3. Cibles tactiles & mobile

- [ ] Hit target ≥ 24px ; sur mobile ≥ 44px (zone élargie si le visuel est plus petit)
- [ ] Champs texte mobile : `font-size` ≥ 16px (pas de zoom auto iOS)
- [ ] Viewport **n’a pas** `user-scalable=no` ni `maximum-scale=1`
- [ ] Contrôles : `touch-action: manipulation`
- [ ] `-webkit-tap-highlight-color` défini intentionnellement (pas défaut criard non designé)
- [ ] Safe areas : `env(safe-area-inset-*)` respectées sur layouts full-bleed / fixed bottom CTA

---

## 4. Navigation & liens

- [ ] Tous les liens de navigation sont des `<a href>` / `<Link>` (Cmd/Ctrl+clic, molette, menu contextuel OK)
- [ ] Aucun `<div>` / `<span>` / `<button>` utilisé **uniquement** pour naviguer vers une autre URL
- [ ] CTA principaux ont un href réel (pas seulement `onClick` de navigation)
- [ ] Pas de « dead zone » : zone qui paraît cliquable = réellement interactive
- [ ] État partageable dans l’URL si filtres / tabs / panels (sinon N/A pour landing statique)
- [ ] Back/Forward restaure le scroll (smoke test) — ou N/A SPA sans historique

---

## 5. Motion & feedback

- [ ] `prefers-reduced-motion` : variante réduite ou animations désactivées
- [ ] Animations limitées à `transform` / `opacity` (pas width/height/top/left)
- [ ] Aucun `transition: all` (propriétés listées explicitement)
- [ ] Pas d’autoplay de motion décorative non interruptible ; motion liée à l’action utilisateur de préférence
- [ ] Animations interruptibles (input utilisateur peut annuler / surcharger)
- [ ] Boutons en chargement : indicateur **et** label d’origine conservé — ou N/A
- [ ] Si spinner/skeleton : délai d’apparition ~150–300 ms et durée min visible ~300–500 ms (anti-flicker) — ou N/A
- [ ] Actions destructives : confirmation ou Undo — ou N/A

---

## 6. Layout & responsive

- [ ] Alignements intentionnels (grille / bords / baselines) — pas d’éléments « flottants » accidentels
- [ ] Pas de scrollbar horizontale parasite ; overflows corrigés
- [ ] Contenu lisible mobile / laptop / ultra-wide
- [ ] Lockups icône + texte : poids/taille/couleur équilibrés
- [ ] Layout via flex/grid CSS (pas de mesure JS pour le flux principal)
- [ ] Contenu long / court / UGC : pas de casse de layout (`truncate` / `line-clamp` / `break-words` / `min-w-0` sur flex children) — ou N/A si texte 100 % éditorial contrôlé

---

## 7. Typographie & microcopy

- [ ] Ellipsis typographique `…` (pas trois points `...`)
- [ ] États loading / suites : « Loading… », « Saving… », « Learn more… » si applicable
- [ ] Guillemets typographiques “ ” dans le copy éditorial (si contrôlé)
- [ ] Titres : `text-wrap: balance` ou `text-pretty` (anti-veuves) si supporté
- [ ] Comparaisons chiffrées : `font-variant-numeric: tabular-nums` — ou N/A
- [ ] Unités / raccourcis / noms collés : espaces insécables (`10&nbsp;MB`, `⌘&nbsp;K`, marque + produit)
- [ ] `<title>` (et meta OG si présents) reflètent la page courante
- [ ] Aucune impasse : chaque écran / état offre une suite ou récupération (404, empty, erreur)

---

## 8. Formulaires (si présents ; sinon section N/A)

- [ ] Chaque contrôle a un `<label>` associé ou nom accessible équivalent
- [ ] Clic sur le label focus/active le contrôle
- [ ] `autocomplete` + `name` significatifs
- [ ] `type` / `inputmode` corrects (email, tel, etc.)
- [ ] Paste **non** bloqué
- [ ] Submit **non** pré-désactivé ; disable seulement pendant la requête + spinner
- [ ] Erreurs inline à côté des champs ; focus sur la première erreur au submit
- [ ] Placeholders = exemples + se terminent par `…`
- [ ] Spellcheck désactivé sur email / codes / username
- [ ] Warn unsaved changes avant navigation si données saisies
- [ ] Compat password manager / collage OTP si auth — ou N/A
- [ ] Checkboxes/radios : pas de dead zone (label+contrôle = une cible)
- [ ] `select` natif : `background-color` et `color` explicites (bug Windows dark)

---

## 9. Images & performance

- [ ] Images avec dimensions explicites (width/height ou aspect-ratio réservé) — **zéro CLS** image
- [ ] Above-the-fold : preload / `priority` / `fetchpriority="high"` sur LCP
- [ ] Below-the-fold : `loading="lazy"`
- [ ] Fonts critiques preload + `font-display: swap` (ou stratégie équivalente anti FOIT/CLS)
- [ ] `preconnect` vers origines CDN/assets si domaines tiers
- [ ] Pas de liste &gt; 50 items rendue sans virtualisation / `content-visibility` — ou N/A
- [ ] Skeletons / placeholders réservent l’espace final — ou N/A
- [ ] Work JS lourd hors main thread si applicable — ou N/A

---

## 10. Contraste, thème & craft visuel

- [ ] Contraste texte / UI suffisant (préférer mesure **APCA** ; a minima AA si seul outil dispo)
- [ ] États `:hover` / `:active` / `:focus` **plus** contrastés que le repos
- [ ] Boutons/liens ont un feedback hover visible
- [ ] Thème sombre : `color-scheme: dark` sur `html` (scrollbars / UI native)
- [ ] `<meta name="theme-color">` aligné au fond de page — ou N/A justifié
- [ ] Ombres en couches (ambient + direct) si ombres utilisées — ou N/A flat
- [ ] Nested border-radius : rayon enfant ≤ parent, courbes concentriques — ou N/A
- [ ] Fonds non neutres : bordures/ombres teintées vers la même teinte — ou N/A
- [ ] Dégradés : pas de banding visible flagrant (mask CSS → image si besoin)

---

## 11. i18n & contenu technique (si applicable)

- [ ] Dates / nombres / devises via `Intl.DateTimeFormat` / `Intl.NumberFormat` — ou N/A copy fixe
- [ ] Langue détectée via headers / `navigator.languages`, pas IP/GPS — ou N/A site mono-langue
- [ ] Noms de marque / tokens code : `translate="no"` — ou N/A
- [ ] Inputs hydratés : pas de perte de focus/valeur ; `value` + `onChange` ou `defaultValue`

---

## 12. Copywriting Vercel-specific (optionnel)

> Appliquer **uniquement** si brief brand Vercel / ton demandé. Sinon cocher N/A pour la section.

- [ ] Voix active, 2e personne, formulations courtes
- [ ] Marketing : **sentence case** pour titres ; produit UI : Title Case (Chicago) si applicable
- [ ] Labels CTA spécifiques (« Start free trial ») plutôt que vagues (« Continue »)
- [ ] Messages d’erreur : problème + action de sortie
- [ ] Comptages en chiffres (« 8 » pas « eight ») ; unités espacées (`10 MB`)
- [ ] Préférer `&` à `and` là où le guide Vercel s’applique

---

## 13. Anti-patterns (fail immédiat si trouvés)

- [ ] Aucun `user-scalable=no` / `maximum-scale=1`
- [ ] Aucun `onPaste` + `preventDefault` sur champs texte
- [ ] Aucun `transition: all`
- [ ] Aucun `outline-none` sans focus-visible de remplacement
- [ ] Aucune navigation critique sans élément lien réel
- [ ] Aucune image LCP/hero sans espace réservé
- [ ] Aucun bouton icône sans nom accessible
- [ ] Aucun formulaire sans labels

---

## Verdict ship

- [ ] **0 FAIL bloquant** (sections 1–5, 9 CLS, 10 contraste, 13)
- [ ] FAIL non-bloquants listés avec owner / follow-up
- [ ] Si Pro Max applicable : checklist Pro Max aussi passée
- [ ] Design system repo respecté (pas de drift tokens / composants)
