# Driveely — Inventaire des sous-traitants (données personnelles)

Document technique pour formaliser les DPA (Data Processing Agreements).
Complète les pages légales dans `content/driveely/legal/`.

## Responsable de traitement

Driveely — entrepreneur individuel Mikael Florindo Machado (SIREN 453 945 750 ; voir mentions légales).  
Contact RGPD : `NEXT_PUBLIC_DRIVEELY_CONTACT_EMAIL` / contact@driveely.app

## Sous-traitants

| Sous-traitant | Rôle | Données transmises | Localisation | Finalité |
|---------------|------|--------------------|--------------|----------|
| **Supabase** | Auth, Postgres, Storage | Email, profil, historique analyses, captures d'offres, abonnements | EU (projet configuré) | Compte, persistance métier |
| **Vercel** | Hébergement Next.js, logs, WAF, BotID | IP, User-Agent, chemins API, logs applicatifs (scrubbés) | USA/EU edge | Hébergement & anti-abus |
| **Mistral AI** | Vision (extraction offre) | Image de capture d'offre (pas d'identité nominative) | UE/USA selon contrat | Analyse IA |
| **Groq** | Vision failover (si clé configurée) | Image de capture | Selon Groq | Analyse IA fallback |
| **Google Gemini** | Vision failover (si activé) | Image de capture | Selon Google Cloud | Analyse IA fallback |
| **Apple** | StoreKit / App Attest / DeviceCheck ; Apple Maps (côté iOS) | Transaction IDs, attestation hardware ; calculs itinéraire locaux | USA | Paiements, attestation, carto |
| **Mapbox** / Nominatim / OSRM | Géocodage + routage (si Mapbox token / fallbacks) | Adresses extraites, biais GPS éventuel | Selon fournisseur | Distance / rentabilité |
| **Upstash** | Redis (rate limit, cache, challenges) | Identifiants utilisateur hashés / clés techniques | Selon région Upstash | Anti-abus, perf |
| **Sentry** | Erreurs applicatives (si DSN configuré) | User ID hashé, métadonnées pipeline (sans PII brute) | Selon plan Sentry | Observabilité |
| **PostHog** | Analytics produit **web** (si clé configurée) | Events anonymisés / pseudonymisés | EU (`eu.i.posthog.com`) | Produit web (pas dans l’app iOS) |

## Données non transmises aux sous-traitants IA

- Mot de passe (hashé par Supabase Auth uniquement)
- Tokens Bearer / refresh
- Reçus StoreKit JWS bruts (stockés côté serveur, non envoyés à Mistral)
- Adresses postales complètes (non collectées)

## Traçabilité code

| Flux | Fichiers |
|------|----------|
| Vision Mistral | `lib/margeo/vision/providers/mistral.ts` |
| Upload captures | `lib/margeo/services/storage.ts` |
| Auth | `lib/margeo/auth/actions.ts`, Supabase Auth |
| Paiements iOS | `lib/margeo/billing/app-store-verify.ts` |
| Scrubbing logs | `lib/margeo/security/pii-scrub.ts` |
| Export / suppression | `lib/margeo/services/account.ts` |

## Droits utilisateurs (endpoints)

| Droit | Endpoint |
|-------|----------|
| Portabilité | `GET /api/driveely/account/export` |
| Effacement | `DELETE /api/driveely/account` (`{ "confirm": "DELETE" }`) |
| Suppression analyse unitaire | `DELETE /api/driveely/analyses/:id` |

## Actions légales / business (hors code)

- [ ] Signer DPA Supabase
- [ ] Signer DPA Vercel
- [ ] Signer DPA Mistral (+ Gemini si utilisé)
- [ ] Signer DPA Sentry / PostHog / Upstash
- [ ] Mettre à jour registre des traitements CNIL

*Dernière mise à jour : audit privacy ASC (2026-10-01).*
