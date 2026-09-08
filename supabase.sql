create extension if not exists "pgcrypto";

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text not null default 'peemente-coming-soon',
  ip_hash text,
  wants_survey boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

-- IMPORTANT : aucune policy publique n'est créée.
-- Le navigateur n'accède jamais directement à cette table.
-- L'API Next.js utilise la SUPABASE_SERVICE_ROLE_KEY côté serveur.

create index if not exists waitlist_created_at_idx
  on public.waitlist (created_at desc);

-- Si la table existe déjà (projet Allo Doudou), exécute aussi :
alter table public.waitlist
  add column if not exists wants_survey boolean not null default false;
