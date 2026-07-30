---
name: uiux-pro-max
description: "Documentation interne pour UI/UX Pro Max. À consulter AVANT toute création ou refonte d'interface (pages, composants, styles, accessibilité, typo, couleurs). Couvre web et mobile. Relai vers RULES.md + CHECKLIST.md."
---

# UI/UX Pro Max — Skill pointer (agents)

**Avant toute création ou modification d’interface**, lire dans ce dossier :

1. [RULES.md](./RULES.md) — règles dures
2. [CHECKLIST.md](./CHECKLIST.md) — checklist avant / après

Ensuite, selon le besoin :

- [SUMMARY.md](./SUMMARY.md) — capacités et structure de la source
- [EXAMPLES.md](./EXAMPLES.md) — prompts, patterns, do/don’t
- [README.md](./README.md) — index et priorité vs design system repo

## Source installée

Skill d’origine (ground truth runtime) :

`/Users/quentinbouyssou/.agents/skills/ui-ux-pro-max/`

CLI :

```bash
python3 /Users/quentinbouyssou/.agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "Nom Projet"
```

## Priorité design

1. **Design system du repo** (tokens, composants Driveely / frontend-ai-studio / shadcn existants) — toujours d’abord.
2. **UI/UX Pro Max** — couche de guidance (styles, UX, a11y, stacks), pas un remplacement du DS.
3. Ne pas inventer une nouvelle esthétique si le projet en a déjà une.
