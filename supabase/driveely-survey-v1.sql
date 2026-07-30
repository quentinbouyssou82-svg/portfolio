-- Driveely — Questionnaire produit (bêta)
-- Exécuter après les migrations Driveely existantes.
-- Idempotent : if not exists / drop policy if exists.

-- ─── Catalogues ───
create table if not exists public.margeo_surveys (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.margeo_survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.margeo_surveys (id) on delete cascade,
  question_key text not null,
  section_key text not null,
  section_label text not null,
  question_type text not null
    check (question_type in ('single_choice', 'text', 'scale', 'yes_no')),
  label text not null,
  help_text text,
  options jsonb not null default '[]',
  is_required boolean not null default true,
  sort_order integer not null,
  step_index integer not null,
  is_active boolean not null default true,
  introduced_in_version integer not null default 1,
  created_at timestamptz not null default now(),
  unique (survey_id, question_key)
);

create index if not exists margeo_survey_questions_survey_step_idx
  on public.margeo_survey_questions (survey_id, step_index, sort_order);

-- Une réponse (session) par utilisateur et par survey
create table if not exists public.margeo_survey_responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.margeo_surveys (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'draft'
    check (status in ('draft', 'submitted')),
  app_version text,
  device text,
  user_agent text,
  is_ios boolean,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  metadata jsonb not null default '{}',
  unique (survey_id, user_id)
);

create index if not exists margeo_survey_responses_survey_status_idx
  on public.margeo_survey_responses (survey_id, status, submitted_at desc);

create index if not exists margeo_survey_responses_user_idx
  on public.margeo_survey_responses (user_id, updated_at desc);

-- Réponses courantes (1 ligne / question / response)
create table if not exists public.margeo_survey_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.margeo_survey_responses (id) on delete cascade,
  question_id uuid not null references public.margeo_survey_questions (id) on delete restrict,
  question_key text not null,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (response_id, question_id)
);

create index if not exists margeo_survey_answers_key_idx
  on public.margeo_survey_answers (question_key);

-- Historique (conservé à chaque modification)
create table if not exists public.margeo_survey_answer_history (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.margeo_survey_responses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  question_id uuid not null references public.margeo_survey_questions (id) on delete restrict,
  question_key text not null,
  value jsonb not null,
  answered_at timestamptz not null,
  superseded_at timestamptz not null default now()
);

create index if not exists margeo_survey_answer_history_response_idx
  on public.margeo_survey_answer_history (response_id, superseded_at desc);

create index if not exists margeo_survey_answer_history_key_idx
  on public.margeo_survey_answer_history (question_key, superseded_at desc);

-- Triggers updated_at
drop trigger if exists margeo_surveys_set_updated_at on public.margeo_surveys;
create trigger margeo_surveys_set_updated_at
  before update on public.margeo_surveys
  for each row execute function public.margeo_set_updated_at();

drop trigger if exists margeo_survey_responses_set_updated_at on public.margeo_survey_responses;
create trigger margeo_survey_responses_set_updated_at
  before update on public.margeo_survey_responses
  for each row execute function public.margeo_set_updated_at();

drop trigger if exists margeo_survey_answers_set_updated_at on public.margeo_survey_answers;
create trigger margeo_survey_answers_set_updated_at
  before update on public.margeo_survey_answers
  for each row execute function public.margeo_set_updated_at();

-- ─── RLS ───
alter table public.margeo_surveys enable row level security;
alter table public.margeo_survey_questions enable row level security;
alter table public.margeo_survey_responses enable row level security;
alter table public.margeo_survey_answers enable row level security;
alter table public.margeo_survey_answer_history enable row level security;

drop policy if exists margeo_surveys_select_active on public.margeo_surveys;
create policy margeo_surveys_select_active on public.margeo_surveys
  for select to authenticated
  using (is_active = true);

drop policy if exists margeo_survey_questions_select_active on public.margeo_survey_questions;
create policy margeo_survey_questions_select_active on public.margeo_survey_questions
  for select to authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.margeo_surveys s
      where s.id = survey_id and s.is_active = true
    )
  );

drop policy if exists margeo_survey_responses_select_own on public.margeo_survey_responses;
create policy margeo_survey_responses_select_own on public.margeo_survey_responses
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists margeo_survey_responses_insert_own on public.margeo_survey_responses;
create policy margeo_survey_responses_insert_own on public.margeo_survey_responses
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists margeo_survey_responses_update_own on public.margeo_survey_responses;
create policy margeo_survey_responses_update_own on public.margeo_survey_responses
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists margeo_survey_answers_select_own on public.margeo_survey_answers;
create policy margeo_survey_answers_select_own on public.margeo_survey_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.margeo_survey_responses r
      where r.id = response_id and r.user_id = auth.uid()
    )
  );

drop policy if exists margeo_survey_answers_insert_own on public.margeo_survey_answers;
create policy margeo_survey_answers_insert_own on public.margeo_survey_answers
  for insert to authenticated
  with check (
    exists (
      select 1 from public.margeo_survey_responses r
      where r.id = response_id and r.user_id = auth.uid()
    )
  );

drop policy if exists margeo_survey_answers_update_own on public.margeo_survey_answers;
create policy margeo_survey_answers_update_own on public.margeo_survey_answers
  for update to authenticated
  using (
    exists (
      select 1 from public.margeo_survey_responses r
      where r.id = response_id and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.margeo_survey_responses r
      where r.id = response_id and r.user_id = auth.uid()
    )
  );

drop policy if exists margeo_survey_answer_history_select_own on public.margeo_survey_answer_history;
create policy margeo_survey_answer_history_select_own on public.margeo_survey_answer_history
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists margeo_survey_answer_history_insert_own on public.margeo_survey_answer_history;
create policy margeo_survey_answer_history_insert_own on public.margeo_survey_answer_history
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Pas de delete client (historique / audit)
drop policy if exists margeo_survey_responses_delete_block on public.margeo_survey_responses;
create policy margeo_survey_responses_delete_block on public.margeo_survey_responses
  for delete to authenticated using (false);

drop policy if exists margeo_survey_answers_delete_block on public.margeo_survey_answers;
create policy margeo_survey_answers_delete_block on public.margeo_survey_answers
  for delete to authenticated using (false);

-- ─── Seed survey beta_product_v1 ───
insert into public.margeo_surveys (slug, title, description, version, is_active)
values (
  'beta_product_v1',
  'Questionnaire produit Driveely',
  'Aide-nous à construire l''outil indispensable des livreurs pendant la bêta.',
  1,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  updated_at = now();

do $$
declare
  sid uuid;
begin
  select id into sid from public.margeo_surveys where slug = 'beta_product_v1';

  -- Helper: upsert by question_key
  insert into public.margeo_survey_questions as q (
    survey_id, question_key, section_key, section_label, question_type,
    label, options, is_required, sort_order, step_index, introduced_in_version
  )
  values
  -- Step 0 — Profil
  (sid, 'delivery_tenure', 'profile', 'Profil', 'single_choice',
   'Depuis combien de temps effectuez-vous des livraisons ?',
   '[{"value":"lt_1m","label":"< 1 mois"},{"value":"1_6m","label":"1 à 6 mois"},{"value":"6_12m","label":"6 à 12 mois"},{"value":"gt_1y","label":"Plus d''un an"}]'::jsonb,
   true, 1, 0, 1),
  (sid, 'main_platform', 'profile', 'Profil', 'single_choice',
   'Quelle plateforme utilisez-vous le plus ?',
   '[{"value":"uber_eats","label":"Uber Eats"},{"value":"deliveroo","label":"Deliveroo"},{"value":"stuart","label":"Stuart"},{"value":"several","label":"Plusieurs"}]'::jsonb,
   true, 2, 0, 1),
  (sid, 'weekly_hours', 'profile', 'Profil', 'single_choice',
   'Combien d''heures livrez-vous par semaine ?',
   '[{"value":"lt_10","label":"< 10 h"},{"value":"10_20","label":"10–20 h"},{"value":"20_35","label":"20–35 h"},{"value":"gt_35","label":"35 h +"}]'::jsonb,
   true, 3, 0, 1),

  -- Step 1 — Utilisation
  (sid, 'usage_frequency', 'usage', 'Utilisation de Driveely', 'single_choice',
   'À quelle fréquence utilisez-vous Driveely ?',
   '[{"value":"every_ride","label":"À chaque course"},{"value":"several_daily","label":"Plusieurs fois par jour"},{"value":"few_weekly","label":"Quelques fois par semaine"},{"value":"rarely","label":"Rarement"}]'::jsonb,
   true, 4, 1, 1),
  (sid, 'influences_decisions', 'usage', 'Utilisation de Driveely', 'single_choice',
   'Driveely influence-t-il vos décisions ?',
   '[{"value":"always","label":"Toujours"},{"value":"often","label":"Souvent"},{"value":"sometimes","label":"Parfois"},{"value":"never","label":"Jamais"}]'::jsonb,
   true, 5, 1, 1),
  (sid, 'more_confident', 'usage', 'Utilisation de Driveely', 'single_choice',
   'Vous sentez-vous plus confiant avant d''accepter une course ?',
   '[{"value":"yes_a_lot","label":"Oui beaucoup"},{"value":"yes","label":"Oui"},{"value":"a_bit","label":"Un peu"},{"value":"no","label":"Non"}]'::jsonb,
   true, 6, 1, 1),
  (sid, 'analysis_speed', 'usage', 'Utilisation de Driveely', 'single_choice',
   'Les analyses sont-elles suffisamment rapides ?',
   '[{"value":"excellent","label":"Excellentes"},{"value":"good","label":"Bonnes"},{"value":"average","label":"Moyennes"},{"value":"too_slow","label":"Trop lentes"}]'::jsonb,
   true, 7, 1, 1),
  (sid, 'results_credible', 'usage', 'Utilisation de Driveely', 'single_choice',
   'Les résultats vous semblent-ils crédibles ?',
   '[{"value":"always","label":"Toujours"},{"value":"often","label":"Souvent"},{"value":"sometimes","label":"Parfois"},{"value":"rarely","label":"Rarement"}]'::jsonb,
   true, 8, 1, 1),

  -- Step 2 — Valeur
  (sid, 'most_used_feature', 'value', 'Valeur du produit', 'single_choice',
   'Quelle fonctionnalité utilisez-vous le plus ?',
   '[{"value":"ai_analysis","label":"Analyse IA"},{"value":"history","label":"Historique"},{"value":"settings","label":"Paramètres"},{"value":"other","label":"Autre"}]'::jsonb,
   true, 9, 2, 1),
  (sid, 'most_valuable_feature', 'value', 'Valeur du produit', 'text',
   'Quelle fonctionnalité vous apporte le plus de valeur ?',
   '[]'::jsonb, true, 10, 2, 1),
  (sid, 'missing_feature', 'value', 'Valeur du produit', 'text',
   'Quelle fonctionnalité manque le plus aujourd''hui ?',
   '[]'::jsonb, true, 11, 2, 1),
  (sid, 'refused_thanks_to_app', 'value', 'Valeur du produit', 'yes_no',
   'Avez-vous déjà refusé une course grâce à Driveely ?',
   '[{"value":"yes","label":"Oui"},{"value":"no","label":"Non"}]'::jsonb,
   true, 12, 2, 1),

  -- Step 3 — Impact & Prix
  (sid, 'earned_more', 'pricing', 'Impact & prix', 'single_choice',
   'Pensez-vous avoir gagné davantage d''argent grâce à Driveely ?',
   '[{"value":"yes_clearly","label":"Oui clairement"},{"value":"probably","label":"Probablement"},{"value":"unsure","label":"Je ne sais pas encore"},{"value":"no","label":"Non"}]'::jsonb,
   true, 13, 3, 1),
  (sid, 'would_miss', 'pricing', 'Impact & prix', 'single_choice',
   'Si Driveely disparaissait demain, cela vous manquerait-il ?',
   '[{"value":"enormously","label":"Énormément"},{"value":"yes","label":"Oui"},{"value":"a_bit","label":"Un peu"},{"value":"not_really","label":"Pas vraiment"}]'::jsonb,
   true, 14, 3, 1),
  (sid, 'fair_price', 'pricing', 'Impact & prix', 'single_choice',
   'Quel abonnement vous semblerait le plus juste ?',
   '[{"value":"free_only","label":"Gratuit uniquement"},{"value":"2_99","label":"2,99 €/mois"},{"value":"4_99","label":"4,99 €/mois"},{"value":"6_99","label":"6,99 €/mois"},{"value":"9_99","label":"9,99 €/mois"},{"value":"more","label":"Plus"}]'::jsonb,
   true, 15, 3, 1),
  (sid, 'willing_to_pay', 'pricing', 'Impact & prix', 'single_choice',
   'Si Driveely vous faisait réellement gagner plusieurs dizaines d''euros par semaine, seriez-vous prêt à payer un abonnement ?',
   '[{"value":"yes","label":"Oui"},{"value":"maybe","label":"Peut-être"},{"value":"no","label":"Non"}]'::jsonb,
   true, 16, 3, 1),
  (sid, 'subscribe_criteria', 'pricing', 'Impact & prix', 'text',
   'Quel critère vous convaincrait de vous abonner ?',
   '[]'::jsonb, true, 17, 3, 1),

  -- Step 4 — Satisfaction
  (sid, 'score_1_10', 'satisfaction', 'Satisfaction', 'scale',
   'Sur une échelle de 1 à 10, quelle note donneriez-vous à Driveely ?',
   '[{"value":"1","label":"1"},{"value":"2","label":"2"},{"value":"3","label":"3"},{"value":"4","label":"4"},{"value":"5","label":"5"},{"value":"6","label":"6"},{"value":"7","label":"7"},{"value":"8","label":"8"},{"value":"9","label":"9"},{"value":"10","label":"10"}]'::jsonb,
   true, 18, 4, 1),
  (sid, 'would_recommend', 'satisfaction', 'Satisfaction', 'yes_no',
   'Recommanderiez-vous Driveely à un autre livreur ?',
   '[{"value":"yes","label":"Oui"},{"value":"no","label":"Non"}]'::jsonb,
   true, 19, 4, 1),
  (sid, 'indispensable_change', 'satisfaction', 'Satisfaction', 'text',
   'Quel est LE changement qui ferait de Driveely une application indispensable pour vous ?',
   '[]'::jsonb, true, 20, 4, 1)
  on conflict (survey_id, question_key) do update set
    section_key = excluded.section_key,
    section_label = excluded.section_label,
    question_type = excluded.question_type,
    label = excluded.label,
    options = excluded.options,
    is_required = excluded.is_required,
    sort_order = excluded.sort_order,
    step_index = excluded.step_index,
    is_active = true;
end $$;

-- ─── Vues analytics (prêtes pour dashboard admin — pas d'UI) ───
create or replace view public.driveely_survey_completion_stats as
select
  s.slug,
  s.title,
  count(r.id) as total_responses,
  count(*) filter (where r.status = 'submitted') as submitted_count,
  count(*) filter (where r.status = 'draft') as draft_count,
  round(
    100.0 * count(*) filter (where r.status = 'submitted') / nullif(count(r.id), 0),
    1
  ) as completion_rate_pct,
  min(r.submitted_at) as first_submission,
  max(r.submitted_at) as last_submission
from public.margeo_surveys s
left join public.margeo_survey_responses r on r.survey_id = s.id
group by s.id, s.slug, s.title;

create or replace view public.driveely_survey_satisfaction as
select
  date_trunc('week', r.submitted_at) as week,
  avg((a.value->>'score')::numeric) as avg_score,
  count(*) as n,
  percentile_cont(0.5) within group (order by (a.value->>'score')::numeric) as median_score
from public.margeo_survey_answers a
join public.margeo_survey_responses r on r.id = a.response_id
where a.question_key = 'score_1_10'
  and r.status = 'submitted'
  and a.value ? 'score'
group by 1
order by 1 desc;

create or replace view public.driveely_survey_nps as
select
  date_trunc('week', r.submitted_at) as week,
  count(*) filter (where a.value->>'choice' = 'yes') as promoters_proxy,
  count(*) filter (where a.value->>'choice' = 'no') as detractors_proxy,
  count(*) as n,
  round(
    100.0 * (
      count(*) filter (where a.value->>'choice' = 'yes')
      - count(*) filter (where a.value->>'choice' = 'no')
    ) / nullif(count(*), 0),
    1
  ) as recommend_net_pct
from public.margeo_survey_answers a
join public.margeo_survey_responses r on r.id = a.response_id
where a.question_key = 'would_recommend'
  and r.status = 'submitted'
group by 1
order by 1 desc;

create or replace view public.driveely_survey_price_preference as
select
  a.value->>'choice' as price_choice,
  count(*) as n,
  round(100.0 * count(*) / nullif(sum(count(*)) over (), 0), 1) as pct
from public.margeo_survey_answers a
join public.margeo_survey_responses r on r.id = a.response_id
where a.question_key = 'fair_price'
  and r.status = 'submitted'
group by 1
order by n desc;

create or replace view public.driveely_survey_feature_demand as
select
  a.question_key,
  a.value->>'text' as verbatim,
  r.submitted_at,
  r.user_id
from public.margeo_survey_answers a
join public.margeo_survey_responses r on r.id = a.response_id
where a.question_key in ('most_valuable_feature', 'missing_feature', 'indispensable_change', 'subscribe_criteria')
  and r.status = 'submitted'
  and nullif(trim(a.value->>'text'), '') is not null
order by r.submitted_at desc;

create or replace view public.driveely_survey_choice_breakdown as
select
  a.question_key,
  q.label as question_label,
  a.value->>'choice' as choice_value,
  count(*) as n
from public.margeo_survey_answers a
join public.margeo_survey_responses r on r.id = a.response_id
join public.margeo_survey_questions q on q.id = a.question_id
where r.status = 'submitted'
  and a.value ? 'choice'
group by 1, 2, 3
order by a.question_key, n desc;
