---
name: vercel-design
description: >-
  Audit landing pages and marketing UI against Vercel Web Interface Guidelines.
  Use when: landing page, audit UI, Vercel guidelines, design review, marketing
  page, web interface guidelines, a11y review of marketing surfaces, pre-ship
  landing audit. Every landing page must be audited against CHECKLIST.md before ship.
---

# Vercel Design — Web Interface Guidelines (agents)

**Toute landing page doit être auditée contre [CHECKLIST.md](./CHECKLIST.md) avant ship.**

## Quand activer ce skill

- Landing / marketing page (création, refonte, review)
- Audit UI / design review
- Mentions de *Vercel Web Interface Guidelines*, Geist (contexte a11y/interaction), ou « guidelines Vercel »

## Workflow obligatoire

1. Lire [CHECKLIST.md](./CHECKLIST.md) et cocher chaque item **applicable** (marquer N/A avec raison si hors scope).
2. S’appuyer sur [RULES.md](./RULES.md) pour le détail MUST/SHOULD/NEVER.
3. Produire un rapport : PASS / FAIL / N/A par section + findings `fichier:ligne` si code disponible.
4. Corriger les FAIL bloquants (a11y, focus, zoom, contrast, liens, CLS) avant de considérer le ship OK.

## Priorité design

1. **Design system du repo** (tokens, composants, brand) — toujours d’abord.
2. **Ce skill (Vercel Web Interface Guidelines)** — craft interaction / a11y / perf / content.
3. Si [`../uiux-pro-max/`](../uiux-pro-max/) s’applique aussi : lancer **les deux** checklists (Vercel + Pro Max). Le DS repo gagne en cas de conflit esthétique.

## Fichiers

| Fichier | Rôle |
|---------|------|
| [CHECKLIST.md](./CHECKLIST.md) | Checklist actionnable (livrable principal) |
| [RULES.md](./RULES.md) | Règles regroupées |
| [SUMMARY.md](./SUMMARY.md) | Résumé fidèle aux sources |
| [EXAMPLES.md](./EXAMPLES.md) | Pass/fail + prompts d’audit |
| [README.md](./README.md) | Index |

## Source canonique

- https://vercel.com/design/guidelines
- https://github.com/vercel-labs/web-interface-guidelines

Ne **pas** inventer de règles hors de ces sources. La section *Vercel-specific* (copywriting) n’est pas universelle — l’appliquer seulement si le brief demande le ton Vercel / marketing sentence case.
