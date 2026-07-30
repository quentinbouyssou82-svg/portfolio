# Vercel Design — index

Skill agent pour auditer les **landing pages** et surfaces marketing contre les **Vercel Web Interface Guidelines**.

## Quand l’utiliser

- Avant de shipper une landing / page marketing
- Review design / audit UI demandé explicitement
- Mentions « Vercel guidelines », « Web Interface Guidelines », « design review »

**Règle dure :** toute landing doit passer [CHECKLIST.md](./CHECKLIST.md) avant ship.

## Comment auditer (agents)

1. Ouvrir [CHECKLIST.md](./CHECKLIST.md).
2. Parcourir la page (code + rendu) section par section.
3. Cocher `[x]` / laisser `[ ]` / noter `N/A — …`.
4. Lister les FAIL avec localisation concrète.
5. Corriger puis re-vérifier les items bloquants.

## Documents

| Doc | Contenu |
|-----|---------|
| [SKILL.md](./SKILL.md) | Frontmatter Cursor + workflow |
| [CHECKLIST.md](./CHECKLIST.md) | Checklist vérifiable (principal) |
| [RULES.md](./RULES.md) | Règles regroupées MUST/SHOULD/NEVER |
| [SUMMARY.md](./SUMMARY.md) | Résumé des guidelines + URLs sources |
| [EXAMPLES.md](./EXAMPLES.md) | Exemples pass/fail et prompts |

## Skills complémentaires

- [`../uiux-pro-max/`](../uiux-pro-max/) — si présent, lancer **aussi** Pro Max quand les deux s’appliquent.
- Design system du projet — **prioritaire** pour brand / tokens / composants.

## Hors scope

- Magic MCP / shadcn / frontend-design agents (indépendant).
- Inventer des règles non documentées dans les sources Vercel.
- Traiter *Geist* comme une checklist de landing : Geist est un design system produit (composants, couleurs, typo) ; les règles d’audit UI viennent des **Web Interface Guidelines**.

## Miroir global Cursor

Copie légère pour réutilisation multi-projets :

`~/.cursor/skills/vercel-design/` → pointer vers ce dossier canonique + `CHECKLIST.md` vendored.
