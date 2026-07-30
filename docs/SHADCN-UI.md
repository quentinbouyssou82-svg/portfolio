# shadcn/ui — Driveely / Portfolio

Documentation interne de l’installation shadcn/ui dans le monorepo **portfolio** (cible web Driveely + site Nocta).

> Dernière mise à jour : 2026-07-30  
> CLI / package `shadcn` : **4.16.0** (stable)  
> Style : **radix-nova** · RSC : **oui** · Tailwind : **v4.3.0**

---

## 1. Où c’est installé

| Emplacement | Rôle | shadcn formel ? |
|-------------|------|----------------|
| **Racine** `/Users/quentinbouyssou/portfolio` | App Next.js principale (Nocta + Driveely sous `/demos/driveely` et domaines Driveely) | **Oui** — `components.json`, deps, CLI |
| `components/ui/` | Primitives partagées / site portfolio | Config CLI pointe ici |
| `components/margeo/ui/` | **Design system Driveely** (tokens `mg-*`) | Inspiré shadcn (cva/`cn`), **pas** généré par la CLI — à préserver |
| `margeo/` (dossier séparé) | Ancien / parallèle Next (exclu du `tsconfig` racine) | Stack cva locale, **pas** de `components.json` |
| `calisthenics-tracker/`, `vitrines-demo/` | Autres apps | Hors scope Driveely |
| `/Users/quentinbouyssou/Developer/ios-app` | App native Swift / Xcode | **Pas** de shadcn (non pertinent) |

### Config actuelle (`components.json`)

- **style** : `radix-nova`
- **base** : Radix (`radix-ui` package)
- **rsc** : `true`
- **tsx** : `true`
- **iconLibrary** : `lucide`
- **tailwind.config** : vide (Tailwind v4 via CSS)
- **css** : `app/globals.css`
- **aliases** : `@/components`, `@/components/ui`, `@/lib/utils`, `@/lib`, `@/hooks`

### Dépendances clés (résolues)

| Package | Version |
|---------|---------|
| `shadcn` | 4.16.0 |
| `radix-ui` | 1.6.7 |
| `tw-animate-css` | 1.4.0 |
| `class-variance-authority` | 0.7.1 |
| `clsx` | 2.1.1 |
| `tailwind-merge` | 3.6.0 |
| `lucide-react` | 1.28.0 |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.0 |
| `next` | 16.2.6 |
| `react` | 19.2.4 |

### CSS / tokens

- Imports shadcn dans `app/globals.css` : `tw-animate-css`, `shadcn/tailwind.css`
- Tokens sémantiques shadcn (`--card`, `--primary-foreground`, `--destructive`, etc.) **mappés** sur la palette Nocta
- Thème sombre portfolio via **`[data-theme="dark"]`** (pas uniquement `.dark`)
- Driveely reste isolé dans `app/demos/driveely/driveely.css` (tokens `mg-*`)

---

## 2. Composants disponibles (inventaire filesystem)

Inventaire réel après mise à jour — **aucun composant inventé**.

### A. `components/ui/` (cible CLI shadcn)

| Fichier | Origine | Notes |
|---------|---------|--------|
| `button.tsx` | Custom Nocta (conservé) | Variants `default` / `outline` / `ghost`, styles portfolio — **ne pas écraser** avec `add --overwrite` |
| `card.tsx` | Custom Nocta | `Card` + `CardContent` |
| `input.tsx` | Custom Nocta | |
| `textarea.tsx` | Custom Nocta | |
| `label.tsx` | shadcn (radix-nova) | Ajouté via CLI |
| `separator.tsx` | shadcn (radix-nova) | Ajouté via CLI |
| `magnetic-button.tsx` | Custom motion | Portfolio / v2 |
| `card-hover-glow.tsx` | Custom motion | Portfolio / v2 |
| `emoji-3d.tsx` | Custom | |

### B. `components/margeo/ui/` (Driveely — à privilégier dans l’app)

| Fichier | Rôle |
|---------|------|
| `button.tsx` | CTA Driveely (cva, variants `primary` / `secondary` / `ghost` / `outline` / `danger`, `loading`) |
| `card.tsx` | Surfaces `mg-card` (+ `CardHeader` / `CardTitle` / `CardContent`) |
| `input.tsx` | Champs formulaires |
| `numeric-input.tsx` | Saisie numérique métier |
| `badge.tsx` | Labels discrets |
| `switch.tsx` | Toggle accessible (`role="switch"`) |
| `skeleton.tsx` | Loading |
| `spinner.tsx` | Indicateur de chargement |
| `empty-state.tsx` | États vides |
| `error-state.tsx` | États d’erreur |

### C. `margeo/components/ui/` (app parallèle, hors build racine)

`badge`, `button`, `card`, `input`, `skeleton`, `switch` — miroir plus ancien ; **ne pas** synchroniser automatiquement avec la CLI racine.

### D. Utilitaires

- `lib/utils.ts` — `cn()` (portfolio / shadcn)
- `lib/margeo/utils.ts` — `cn()` + formatters Driveely (`formatEur`, etc.)

---

## 3. Bonnes pratiques

### Tokens & Tailwind

1. **Driveely** : toujours les classes / CSS vars `mg-*` (`bg-mg-card`, `text-mg-foreground`, `border-mg-border`, `ring-mg-accent`, etc.) définies dans `driveely.css`.
2. **Portfolio / Nocta** : tokens `--background`, `--foreground`, `--accent`, `--surface`, etc. dans `globals.css`.
3. Les tokens shadcn (`bg-primary`, `text-muted-foreground`, `border-border`) sont disponibles pour les composants CLI dans `components/ui/`, mais **ne remplacent pas** le design system Driveely.
4. Composer avec `cn()` ; variants avec `cva` quand il y a plusieurs apparences stables.

### Composition

- Préférer composer `Button` + `Card` + états (`EmptyState` / `ErrorState` / `Skeleton`) plutôt que d’ajouter des layouts shadcn lourds (sidebar, dashboard blocks).
- Nouveaux primitives shadcn → `npx shadcn@latest add <name>` dans la **racine portfolio**, puis adapter les classes si besoin.
- Ne jamais cibler `components/margeo/ui` avec la CLI sauf intention explicite de migration.

### Accessibilité

- Garder `focus-visible:ring-*`, labels associés (`Label` + `htmlFor` / `aria-labelledby`).
- `Switch` Driveely : conserver `role="switch"` + `aria-checked`.
- Boutons : `disabled` + `aria-busy` quand `loading`.
- Respecter les tailles tactiles Driveely (`min-h-11` / `min-h-9` selon taille).

### Commandes utiles

```bash
# État du projet
npx shadcn@latest info

# Ajouter un composant (sans écraser les customs)
npx shadcn@latest add <component>

# Diff / mise à jour contrôlée
npx shadcn@latest add <component> --diff
# Éviter --overwrite sur button/card/input/textarea portfolio
```

---

## 4. Composants à privilégier (Driveely SaaS)

Pour l’UI produit Driveely (`app/demos/driveely`, `components/margeo/*`) :

| Priorité | Composant | Pourquoi |
|----------|-----------|----------|
| ★★★ | `@/components/margeo/ui/button` | CTA, paywall, formulaires — tokens et motion Driveely |
| ★★★ | `@/components/margeo/ui/card` | Cartes analyse, stats, paywall |
| ★★★ | `@/components/margeo/ui/input` + `numeric-input` | Profil, historique, onboarding |
| ★★★ | `skeleton` / `spinner` / `empty-state` / `error-state` | États async cohérents |
| ★★ | `badge` / `switch` | Métadonnées et toggles profil |
| ★ | `components/ui/label` / `separator` | Primitives a11y génériques si besoin hors `mg-*` |

Règle : **dans Driveely, importer depuis `@/components/margeo/ui/*`**, pas depuis `@/components/ui/*`.

---

## 5. Composants à éviter (et pourquoi)

| À éviter | Pourquoi |
|----------|----------|
| Écraser `components/ui/button` (ou card/input) via `shadcn add --overwrite` | Casse le look Nocta (gradients, glow, tailles hero) |
| Remplacer `components/margeo/ui/*` par les primitives stock shadcn | Conflit avec tokens `mg-*`, paywall, loading, touch targets |
| `Sidebar` / blocs dashboard shadcn complets | Driveely a déjà `app-shell` + navigation custom |
| `Sonner` / toasts shadcn en double | `sonner` est déjà une dépendance ; unifier plutôt que dupliquer |
| Thème oklch / preset neutre non mappé | Init CLI avait écrasé `--accent` / `--primary` Nocta — **toujours** remapper sur la palette existante |
| Forcer `font-sans` Geist sur tout le site | Nocta utilise Inter (`--font-body`) + Space Grotesk (`--font-display`) |
| Installer shadcn dans `margeo/` ou `ios-app` | Mauvaise cible : Driveely actif = racine portfolio ; iOS = Swift |
| Composants marketing lourds (carousel, calendar, chart shadcn) sans besoin métier | Surpoids ; Driveely a déjà `earnings-chart`, landing custom |

---

## 6. Historique de la mise à jour (2026-07-30)

1. Constat : utilitaires type-shadcn présents (`cva`, `cn`, `components/ui`) **sans** `components.json` ni package `shadcn`.
2. Init non destructive : `npx shadcn@latest init --template next --base radix -p nova -y --no-reinstall --force --no-monorepo`.
3. Restauration des tokens Nocta dans `globals.css` + mapping sémantique shadcn ; layout fonts restauré (Inter / Space Grotesk).
4. Restauration de `components/ui/button.tsx` custom (la CLI l’avait remplacé une fois).
5. Ajout sûr : `label`, `separator`.
6. `components/margeo/ui` **non modifié**.

### Suivis recommandés

- [ ] Smoke visuel : landing Nocta + shell Driveely (light/dark).
- [ ] Avant tout `add --overwrite`, faire un backup / `--diff`.
- [ ] Si besoin de Dialog / Dropdown Driveely : ajouter via CLI dans `components/ui`, puis wrapper stylé `mg-*` sous `components/margeo/ui` si réutilisation produit.
- [ ] Licence Xcode non acceptée sur la machine : `git` CLI peut échouer ; préférer Node/npm pour les ops locales.

---

## 7. Références

- Docs : https://ui.shadcn.com/docs  
- Schema : https://ui.shadcn.com/schema.json  
- Driveely env : [DRIVEELY-ENVIRONMENTS.md](./DRIVEELY-ENVIRONMENTS.md)
