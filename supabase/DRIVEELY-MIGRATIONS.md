# Driveely — Guide migrations Supabase

Exécuter **dans l’ordre**, une seule fois par environnement (Supabase → SQL Editor).

## Ordre obligatoire

```
1. margeo-setup.sql      → tables + triggers
2. margeo-rls.sql        → RLS profiles, rides, analyses, feedback
3. driveely-migrate.sql    → géoloc, vélo électrique, location_logs
4. driveely-backend-v2.sql → storage bucket, vision metadata
5. driveely-beta.sql       → champs nullable, beta_events, premium, vues
6. driveely-beta-v2.sql    → funnel events, is_beta_tester, vues monitoring
7. driveely-beta-v3.sql    → vue driveely_beta_vision_stats (geminiMs, corrections)
8. driveely-survey-v1.sql  → questionnaire produit (surveys, questions, answers, vues NPS)
```

## Vérifications post-migration

```sql
-- Tables Driveely
select tablename from pg_tables
where schemaname = 'public' and tablename like 'margeo_%';

-- RLS activé
select tablename, rowsecurity from pg_tables
where schemaname = 'public' and tablename like 'margeo_%';

-- Bucket storage
select id, public from storage.buckets where id = 'driveely-screenshots';
```

## RLS — qui voit quoi

| Table | Lecture | Écriture client |
|-------|---------|-----------------|
| margeo_profiles | soi | soi |
| margeo_rides | soi | soi |
| margeo_analyses | soi | soi |
| margeo_feedback | soi | soi |
| margeo_location_logs | soi | insert soi |
| margeo_beta_events | soi | **interdit** (API service_role) |
| margeo_surveys | actifs (auth) | **interdit** (seed / admin) |
| margeo_survey_questions | actifs (auth) | **interdit** |
| margeo_survey_responses | soi | insert/update soi |
| margeo_survey_answers | via response soi | insert/update soi |
| margeo_survey_answer_history | soi | insert soi |

## Idempotence

Les fichiers utilisent `if not exists` / `drop policy if exists` — ré-exécutables sauf si vous modifiez manuellement le schéma.

## Rollback

Pas de rollback automatique. Sauvegarder le projet Supabase avant migration prod.

## Activer un testeur Premium (SQL)

```sql
update public.margeo_profiles
set premium = true,
    premium_source = 'beta',
    premium_until = now() + interval '30 days',
    is_beta_tester = true
where id = 'UUID_UTILISATEUR';
```
