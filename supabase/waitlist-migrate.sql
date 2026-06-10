-- À exécuter dans Supabase (projet Nocta Agency OS) → SQL Editor
-- Ajoute les colonnes pour le formulaire liste prioritaire + sync Notion

alter table public.waitlist add column if not exists name text;
alter table public.waitlist add column if not exists company text;
alter table public.waitlist add column if not exists website text;
alter table public.waitlist add column if not exists need text;
alter table public.waitlist add column if not exists source text default 'website';
