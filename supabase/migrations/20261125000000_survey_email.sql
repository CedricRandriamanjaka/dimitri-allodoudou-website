-- Une réponse par e-mail : l'e-mail identifie qui a répondu, un nouvel envoi met à jour la réponse.
-- email reste facultatif (null = réponse anonyme, plusieurs null autorisés par l'index unique).

alter table public.survey_responses
  add column if not exists email text
    check (email is null or (email = lower(btrim(email)) and char_length(email) between 3 and 254)),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists survey_responses_email_key
  on public.survey_responses (email);
