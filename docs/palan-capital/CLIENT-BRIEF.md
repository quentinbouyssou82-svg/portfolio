# Brief client validé — Palan Capital

> Questionnaire complété par le client. Réponses intégrées le 06/06/2026.

## Calendrier

| Échéance | Date |
|----------|------|
| **Mise en ligne** | **19 juin 2026** |
| Hébergement | Netlify (inchangé pour l'instant) |
| Domaine pro | Non — reste Netlify |

---

## 1. Contenu

| Question | Décision |
|----------|----------|
| Textes existants | **Conserver** — modifier le design uniquement, pas le copywriting FR |
| Objectif n°1 | **Formulaire de contact** |
| Infos sensibles à masquer | **Non** — tout le contenu actuel peut rester public |
| Éléments de confiance | **Photo de Julien uniquement** (pas de logos partenaires ni badges) |
| Langues | **Français + Anglais** |

---

## 2. Design

| Question | Décision |
|----------|----------|
| Couleurs | **Liberté créative** — rester finance / premium, lisibilité améliorée |
| Style / ambiance | **Libre arbitre** aligné image de marque |
| Logo | **Peut être refait** |
| Signature italique dorée | **Libre arbitre** |
| Densité | **Site épuré**, espaces vides, **animations légères** |
| Références | Aucune |

---

## 3. Ergonomie

| Question | Décision |
|----------|----------|
| Priorité écran | **Desktop d'abord**, responsive mobile obligatoire |
| Choix du profil à l'accueil | **Oui** — cartes / boutons clairs |
| Images | **Libre de droit** au choix du prestataire (en complément photo Julien) |

---

## 4. Technique

| Question | Décision |
|----------|----------|
| Formulaire | **Mêmes champs** qu'actuellement, design amélioré |
| Email réception | **julien@sas-living.com** |
| Accusé de réception | **Oui** — email auto au prospect |
| Autonomie contenu | **Oui** — client veut modifier textes / articles / photos lui-même → **CMS à prévoir** (Decap CMS + Netlify recommandé) |
| Analytics | **Oui** (visites) |
| LinkedIn / Open Graph | **Non** — pas prioritaire |

---

## 5. Périmètre pages (inchangé)

- Accueil (sélecteur profil renforcé)
- Dirigeants · Patrimoines privés · Fonds · Investisseurs
- Cabinet · Contact · Mentions légales
- Version **EN** de toutes les pages

---

## Roadmap développement (→ 19/06)

### Phase A — Cadrage
- [x] Analyse site actuel (points forts / faibles)
- [x] Textes FR extraits (`lib/palan-capital/content.ts`)
- [x] Brief client validé

### Phase B — Design (maquette Figma)
- [ ] Maquette Figma complète (homepage + 1 page métier + contact)
- [ ] Validation client
- [ ] Design system (couleurs, typo, composants)

### Phase C — Bilingue
- [ ] Routing `/fr` + `/en` (ou switcher + contenu EN)
- [ ] Traduction intégrale des textes (même fond, langue EN)

### Phase D — Automatisations
- [ ] Resend : notification → julien@sas-living.com
- [ ] Resend : accusé de réception prospect
- [ ] Analytics (Plausible ou équivalent)

### Phase E — Autonomie client
- [ ] CMS (Decap CMS) branché sur Netlify
- [ ] Documentation prise en main

### Phase F — Mise en prod
- [ ] Deploy Netlify
- [ ] Tests mobile + desktop
- [ ] Retrait `noindex` sur prod client

---

## Config technique

```env
PALAN_CONTACT_EMAIL=julien@sas-living.com
RESEND_API_KEY=...
PALAN_FROM_EMAIL=contact@palancapital.com  # ou domaine vérifié
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=palan-capital.netlify.app
```

---

## Ce qu'on ne fait PAS (confirmé client)

- Calendly / prise de RDV en ligne
- Logos partenaires (Décathlon, etc.)
- Optimisation partage LinkedIn
- Changement des textes FR sans validation explicite
- Domaine custom (pour l'instant)
