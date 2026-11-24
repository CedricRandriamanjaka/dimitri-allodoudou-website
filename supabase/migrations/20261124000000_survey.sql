-- Questionnaire Peemente : réponses et contacts séparés, aucun lien entre les deux.
-- Les codes autorisés doivent rester identiques à lib/survey.js.

create extension if not exists "pgcrypto";

-- 1. Réponses ---------------------------------------------------------------

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  gender_identity text not null check (gender_identity in
    ('femme_celibataire','homme_celibataire','couple_fh','couple_ff','couple_hh','trans','autre')),
  age_range text not null check (age_range in
    ('18-24','25-29','30-34','35-39','40-44','45-49','50+')),
  sector text not null check (sector in ('nord','sud','est','ouest','hauts')),
  experience text not null check (experience in
    ('jamais','moins_1an','1_3ans','3_10ans','plus_10ans')),
  meeting_methods text[] not null check (
    cardinality(meeting_methods) between 1 and 7
    and meeting_methods <@ array['sites_apps','groupes_reseaux','clubs','soirees_privees','bouche_oreille','pas_encore','autre']),
  libertinage_meaning text not null check (char_length(btrim(libertinage_meaning)) between 1 and 1000),
  main_frustration text not null check (char_length(btrim(main_frustration)) between 1 and 1000),
  top_problems text[] not null check (
    cardinality(top_problems) between 1 and 3
    and top_problems <@ array['faux_profils','messages_lourds','peur_reconnu','manque_meme_age','profils_metropole','lapins','sorties_couteuses','manque_temps','codes','peur_couple','autre']),
  desired_features text[] not null check (
    cardinality(desired_features) between 1 and 3
    and desired_features <@ array['profils_verifies','controle_messages','album_prive','evenements','disponibilites','swipe','groupes_prives','avis_membres','contenus_educatifs','reductions_clubs','autre']),
  ideal_platform text not null check (char_length(btrim(ideal_platform)) between 1 and 1000),
  monthly_budget text not null check (monthly_budget in ('rien','moins_20','20_50','50_100','plus_100')),
  created_at timestamptz not null default now()
);

create index if not exists survey_responses_created_at_idx
  on public.survey_responses (created_at);

-- 2. Contacts ---------------------------------------------------------------
-- created_at tronqué au jour : empêche de rapprocher un e-mail d'une réponse par l'horodatage.

create table if not exists public.launch_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(btrim(email)) and char_length(email) between 3 and 254),
  notification_consent boolean not null default false,
  created_at timestamptz not null default date_trunc('day', now())
);

-- 3. Administrateurs (futur /admin) ----------------------------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 4. RLS : aucune écriture publique, lecture réservée aux admins -------------
-- Les insertions passent uniquement par /api/survey (service_role, côté serveur).

alter table public.survey_responses enable row level security;
alter table public.launch_contacts enable row level security;
alter table public.admins enable row level security;

drop policy if exists "admin read" on public.survey_responses;
create policy "admin read" on public.survey_responses
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "admin read" on public.launch_contacts;
create policy "admin read" on public.launch_contacts
  for select to authenticated using ((select public.is_admin()));

revoke all on public.survey_responses, public.launch_contacts, public.admins from anon;
revoke insert, update, delete, truncate on public.survey_responses, public.launch_contacts, public.admins from authenticated;

-- 5. Vues analytiques -------------------------------------------------------
-- security_invoker : les vues respectent la RLS de l'appelant (admin uniquement).

-- Une ligne par réponse choisie : les tableaux sont dépliés pour des classements exacts.
-- Ex. classement des problèmes : select answer, count(*) from survey_answers where question = 'top_problems' group by 1 order by 2 desc;
create or replace view public.survey_answers with (security_invoker = true) as
select r.id as response_id, r.created_at, r.age_range, r.sector, a.question, a.answer
from public.survey_responses r
cross join lateral (
  values
    ('gender_identity', r.gender_identity),
    ('age_range', r.age_range),
    ('sector', r.sector),
    ('experience', r.experience),
    ('monthly_budget', r.monthly_budget)
  union all select 'meeting_methods', unnest(r.meeting_methods)
  union all select 'top_problems', unnest(r.top_problems)
  union all select 'desired_features', unnest(r.desired_features)
) as a(question, answer);

-- Réponses par jour (fuseau Réunion) ; semaine/mois : date_trunc('week'|'month', day).
create or replace view public.survey_daily with (security_invoker = true) as
select (created_at at time zone 'Indian/Reunion')::date as day, count(*) as responses
from public.survey_responses
group by 1;

create or replace view public.survey_overview with (security_invoker = true) as
select
  (select count(*) from public.survey_responses) as total_responses,
  (select count(*) from public.launch_contacts where notification_consent) as consented_contacts;

revoke all on public.survey_answers, public.survey_daily, public.survey_overview from anon;
grant select on public.survey_answers, public.survey_daily, public.survey_overview to authenticated;
