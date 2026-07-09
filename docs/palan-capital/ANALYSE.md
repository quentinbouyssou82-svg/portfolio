# Palan Capital — Analyse du site actuel

> Site de référence : https://palan-capital.netlify.app  
> Statut projet : **en attente maquette Figma** — code supprimé, reprise à zéro après validation design.

---

## Synthèse

**Palan Capital** est un cabinet indépendant d’**ingénierie financière et de structuration patrimoniale**. Il aide dirigeants, familles fortunées, fonds et investisseurs qualifiés à **créer du levier, révéler la valeur cachée de leurs actifs et structurer des opérations** en France, Luxembourg et Émirats.

**Promesse centrale :** *Créer du levier. Révéler la valeur.*

**Ton :** expert, confidentiel, long terme — pas de promesse de performance.

---

## Informations clés

| Élément | Détail |
|--------|--------|
| **Marque** | Palan Capital |
| **Entité légale** | SAS LIVING — SIREN 983 940 958 · RCS Toulouse |
| **Siège** | 2 rue d'Austerlitz, 31000 Toulouse |
| **Email public** | contact@palancapital.com |
| **Email formulaire** | julien@sas-living.com (+ accusé auto au prospect) |
| **Fondateur** | Julien Guiraud (Président) |
| **Historique** | Pangée (2018, LLD grande distribution — Décathlon, Carrefour, Leroy Merlin) → Palan Capital (2026) |
| **Agréments** | IOBSP ORIAS 2021 · Courtier assurances ORIAS 2012 · CIF en cours |
| **Juridictions** | France · Luxembourg · Émirats Arabes Unis |
| **Deadline** | Mise en ligne **19 juin 2026** |
| **Hébergement** | Netlify |

### Secteur

Finance privée / ingénierie patrimoniale / M&A préparatoire — à la frontière courtage, CIF, structuration cross-border, dette privée et levée de fonds. **Pas** une banque privée classique : un cabinet qui **structure avant de financer**.

### 4 audiences

| Audience | Besoin principal |
|----------|------------------|
| Dirigeants & cédants | Préparer cession/transmission 18–36 mois avant |
| Patrimoines privés | Structuration internationale, transmission |
| Fonds | Optimisation pré-cession, deals complexes |
| Investisseurs qualifiés | Accès opportunités propriétaires (cadre L.411-2 II) |

### 4 expertises

1. Financement & LLD (immobilier pro, véhicules, yachts, jets)
2. Dette privée (obligations structurées, mezzanine)
3. Structuration patrimoniale (fiducie-sûreté, holdings, transmission)
4. Levée de fonds (equity, obligataire, memos IC)

### 3 convictions

1. Structurer avant de financer
2. Révéler la valeur sous-jacente
3. Aligner les intérêts dans la durée

### Pages prévues

- Accueil (sélecteur profil)
- Dirigeants · Patrimoines privés · Fonds · Investisseurs
- Cabinet · Contact · Mentions légales
- Version **EN** de toutes les pages

### Décisions client validées

Voir [`CLIENT-BRIEF.md`](./CLIENT-BRIEF.md) pour le détail questionnaire.

- Textes FR **inchangés** — design uniquement
- CTA principal : **formulaire de contact**
- Confiance : **photo Julien seule** (pas logos partenaires)
- Palette : **liberté créative** (maquette Figma)
- Desktop d'abord + responsive mobile obligatoire
- CMS pour autonomie client
- Analytics oui · pas LinkedIn OG

---

## Points forts

1. **Copywriting excellent** — ton expert, précis, différenciant (pas du jargon vide)
2. **Positionnement clair** — 4 audiences, 4 expertises, 3 convictions
3. **Identité visuelle cohérente** sur le site actuel — palette navy/gold/ivory, reconnaissable
4. **Profondeur métier** — pages dirigeants/investisseurs très détaillées (processus, outils concrets)
5. **Conformité réglementaire** — disclaimers investisseurs, mentions ORIAS/CIF, RGPD évoqué
6. **Structure narrative solide** — expertises → convictions → audiences → CTA
7. **International** — France / Luxembourg / EAU bien mis en avant
8. **Story fondateur** — parcours Pangée → crédibilité opérationnelle
9. **CTA cohérent** — « entretien de cadrage confidentiel » = bon levier de confiance

---

## Points faibles

### Bloquants

| Problème | Impact |
|----------|--------|
| **Aucun responsive mobile** (0 media queries sur le site actuel) | Site illisible / inutilisable sur smartphone |
| **Pas de menu mobile** | Navigation impossible sur petit écran |
| **Site statique HTML/CSS** | Maintenance difficile, pas de CMS |
| **Formulaire non connecté** | Pas de leads automatisés |
| **URL Netlify** | Crédibilité professionnelle limitée |

### UX & confiance

| Problème | Impact |
|----------|--------|
| Textes secondaires faible contraste (35–40 % opacité) | Lisibilité + accessibilité WCAG |
| Pas de preuve sociale visible | Confiance plus lente (client a choisi : photo Julien seule) |
| CTA pas toujours visible au scroll | Perte de conversion |
| Pas de FAQ / processus visualisé | Friction avant contact |
| Agréments « en cours » | Crédibilité temporairement fragile |
| Hero : services en très petit texte | Message secondaire peu lisible |

### Technique & SEO

| Problème | Impact |
|----------|--------|
| Pas de Schema.org, sitemap, OG optimisé | Visibilité Google / partage |
| Fonts Google externes | Performance + privacy |
| Pas de bandeau cookies | Conformité RGPD incomplète |
| Page confidentialité fusionnée avec mentions | UX juridique floue |

### Stratégique (à traiter en refonte)

- Pas de version anglaise (pourtant Luxembourg / EAU)
- Pas de section Insights / Publications
- Contenu investisseur 100 % public (à valider compliance)

---

## Fichiers conservés

| Fichier | Rôle |
|---------|------|
| [`lib/palan-capital/content.ts`](../../lib/palan-capital/content.ts) | Tous les textes FR du site (source de vérité) |
| [`CLIENT-BRIEF.md`](./CLIENT-BRIEF.md) | Décisions client validées |
| [`public/demos/palan-capital/photo-julien.jpg`](../../public/demos/palan-capital/photo-julien.jpg) | Photo fondateur |

---

## Prochaine étape

**Maquette Figma** (toi) → validation → développement from scratch aligné sur le design, sans reprendre l'ancienne structure.
