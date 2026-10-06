-- =====================================================================
--  Chronicles of Astra · esquema de base de datos (Supabase / Postgres)
--  Pégalo entero en: Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes ejecutarlo más de una vez.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Personajes (datos PÚBLICOS que ven los demás jugadores) ----------
create table if not exists public.characters (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 3 and 14),
  class       text not null,
  level       int  not null default 1,
  appearance  jsonb not null default '{}'::jsonb,
  x           real,
  y           real,
  zone        text,
  kills       int  not null default 0,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);
create unique index if not exists characters_name_ci on public.characters (lower(name));
create index if not exists characters_user on public.characters (user_id);
create index if not exists characters_seen on public.characters (last_seen desc);
create index if not exists characters_level on public.characters (level desc);

-- ---------- Estado PRIVADO del personaje (solo su dueño) ----------
create table if not exists public.character_state (
  character_id uuid primary key references public.characters(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  xp           int  not null default 0,
  gold         int  not null default 5,
  inv          jsonb not null default '[]'::jsonb,
  eq           jsonb not null default '{}'::jsonb,
  quests       jsonb not null default '{}'::jsonb,
  disc         jsonb not null default '{}'::jsonb,
  explored     text,
  world_time   real not null default 0,
  options      jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

-- ---------- Chat global persistente ----------
create table if not exists public.chat_messages (
  id           bigint generated always as identity primary key,
  user_id      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  character_id uuid references public.characters(id) on delete set null,
  name         text not null,
  channel      text not null default 'global',
  body         text not null check (char_length(body) between 1 and 200),
  created_at   timestamptz not null default now()
);
create index if not exists chat_recent on public.chat_messages (created_at desc);

-- ---------- Seguridad a nivel de fila (RLS) ----------
alter table public.characters      enable row level security;
alter table public.character_state enable row level security;
alter table public.chat_messages   enable row level security;

drop policy if exists "characters_select_all"  on public.characters;
drop policy if exists "characters_insert_own"  on public.characters;
drop policy if exists "characters_update_own"  on public.characters;
drop policy if exists "characters_delete_own"  on public.characters;

create policy "characters_select_all" on public.characters
  for select to authenticated using (true);
create policy "characters_insert_own" on public.characters
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (select count(*) from public.characters c where c.user_id = auth.uid()) < 6
  );
create policy "characters_update_own" on public.characters
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "characters_delete_own" on public.characters
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "state_select_own" on public.character_state;
drop policy if exists "state_insert_own" on public.character_state;
drop policy if exists "state_update_own" on public.character_state;
drop policy if exists "state_delete_own" on public.character_state;

create policy "state_select_own" on public.character_state
  for select to authenticated using (user_id = auth.uid());
create policy "state_insert_own" on public.character_state
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid())
  );
create policy "state_update_own" on public.character_state
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "state_delete_own" on public.character_state
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "chat_select_all" on public.chat_messages;
drop policy if exists "chat_insert_own" on public.chat_messages;
create policy "chat_select_all" on public.chat_messages
  for select to authenticated using (true);
create policy "chat_insert_own" on public.chat_messages
  for insert to authenticated with check (user_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.characters, public.character_state to authenticated;
grant select, insert on public.chat_messages to authenticated;

-- ---------- Limpieza opcional del chat (conserva las últimas 24 h) ----------
-- Si activas la extensión pg_cron (Database → Extensions), puedes programar:
--   select cron.schedule('astra-chat-cleanup', '0 * * * *',
--     $$ delete from public.chat_messages where created_at < now() - interval '24 hours' $$);

-- ---------- Realtime ----------
-- El multijugador usa canales Broadcast + Presence de Realtime (no requieren tablas).
-- En Supabase → Realtime → Settings, deja activado "Allow public access" (valor por defecto).
