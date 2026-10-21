# Rapport conformité — actions Quentin uniquement

**Date :** 21 octobre 2026  
**Rôle :** Ander — conformité Driveely (pré-App Store)  
**Responsable confirmé dans les docs :** Quentin Bouyssou  
**Contact officiel :** contactdriveelyai@gmail.com

Ce rapport liste uniquement les informations **légalement nécessaires ou fortement recommandées** qui n’ont **pas** pu être confirmées dans le projet sans inventer de données. Les documents publics utilisent une formulation honnête (responsable + e-mail) sans placeholders du type `[SIRET]`.

---

## À compléter avant commercialisation / dépôt App Store

1. **Forme juridique** exacte de l’éditeur actuel (ex. micro-entreprise / EI, autre) — ne plus republier l’ancienne structure Mikael / tutelle Leandro sans validation.
2. **SIREN** et **SIRET** applicables à Quentin Bouyssou / Driveely (les anciens `453 945 750` / `453 945 750 00033` Montauban ont été **retirés** des docs publics car liés à l’ancienne identité).
3. **Adresse professionnelle** à publier dans les mentions légales (LCEN).
4. **Numéro de TVA intracommunautaire** (ou confirmation écrite de non-assujettissement / franchise en base).
5. **Médiateur de la consommation** (coordonnées) pour les CGV — aujourd’hui : « communiquées sur demande après réclamation interne ».
6. **Téléphone** de contact Review App Store Connect (si ASC l’exige).
7. **Compte démo reviewer** (e-mail / mot de passe) pour ASC Review Information.
8. Relecture avocat / expert-comptable avant mise en commercialisation (recommandé, non bloquant technique).

Une fois fournis, ces éléments se publient via :
- variables d’env optionnelles `DRIVEELY_LEGAL_*` (`lib/margeo/legal/entity.ts`) et/ou
- mise à jour directe de `content/driveely/legal/*.md` + miroir iOS `Driveely/Resources/Legal/` + régénération du bundle Swift.

---

## Déjà aligné (pas d’action)

- Éditeur / directeur de publication / responsable de traitement : **Quentin Bouyssou**
- E-mail : **contactdriveelyai@gmail.com**
- Privacy URL : https://www.driveely.app/confidentialite
- Support URL : https://www.driveely.app/contact
- Prestataires techniques conservés : Apple, Supabase, Vercel, Stripe, Mistral, Groq, Gemini, Mapbox/Nominatim/OSRM, Upstash, Sentry, PostHog (web)
- Docs iOS embarqués synchronisés avec le web
