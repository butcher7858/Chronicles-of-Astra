-- =====================================================================
--  Chronicles of Astra · Esquema Oficial de Base de Datos (Supabase / PostgreSQL)
-- =====================================================================
--  INSTRUCCIONES DE INSTALACIÓN:
--  1. Ve a tu panel de Supabase: https://supabase.com/dashboard/project/_/sql
--  2. En el menú izquierdo, haz clic en "SQL Editor" -> "New query".
--  3. Pega TODO este contenido y haz clic en "Run" (ejecutar).
--  4. Es 100% IDEMPOTENTE: Puedes ejecutarlo tanto en una base de datos nueva
--     como en una base de datos existente con personajes ya creados sin perder nada.
--
--  CONSEJO IMPORTANTE (Registro sin confirmar email):
--  - En Supabase -> Authentication -> Providers -> Email:
--    Desactiva la casilla "Confirm email" si deseas que los jugadores puedan
--    registrarse y entrar a jugar inmediatamente sin esperar un correo de verificación.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- 1. TABLA: PERSONAJES (Datos públicos visibles para otros jugadores) ----------
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
  guild_name  text,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);

-- Migración segura por si la tabla ya existía:
alter table public.characters add column if not exists guild_name text;

create unique index if not exists characters_name_ci on public.characters (lower(name));
create index if not exists characters_user on public.characters (user_id);
create index if not exists characters_seen on public.characters (last_seen desc);
create index if not exists characters_level on public.characters (level desc);

-- ---------- 2. TABLA: ESTADO PRIVADO (Inventario, talentos, monturas, equipo) ----------
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
  talents      jsonb not null default '{}'::jsonb,
  mount        text not null default 'horse',
  mounts       jsonb not null default '["horse"]'::jsonb,
  guild        jsonb,
  bags         jsonb not null default '[null,null,null,null]'::jsonb,
  bank         jsonb not null default '[]'::jsonb,
  bank_gold    int   not null default 0,
  achievements jsonb not null default '{}'::jsonb,
  titles       jsonb not null default '["novice"]'::jsonb,
  title        text  not null default '',
  action_bar   jsonb,
  action_bar2  jsonb,
  recipes      jsonb not null default '{}'::jsonb,
  stats_extra  jsonb not null default '{}'::jsonb,
  options      jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

-- Migración segura para añadir nuevas columnas a tablas existentes:
alter table public.character_state add column if not exists talents jsonb not null default '{}'::jsonb;
alter table public.character_state add column if not exists mount text not null default 'horse';
alter table public.character_state add column if not exists mounts jsonb not null default '["horse"]'::jsonb;
alter table public.character_state add column if not exists guild jsonb;
alter table public.character_state add column if not exists bags jsonb not null default '[null,null,null,null]'::jsonb;
alter table public.character_state add column if not exists bank jsonb not null default '[]'::jsonb;
alter table public.character_state add column if not exists bank_gold int not null default 0;
alter table public.character_state add column if not exists achievements jsonb not null default '{}'::jsonb;
alter table public.character_state add column if not exists titles jsonb not null default '["novice"]'::jsonb;
alter table public.character_state add column if not exists title text not null default '';
alter table public.character_state add column if not exists action_bar jsonb;
alter table public.character_state add column if not exists action_bar2 jsonb;
alter table public.character_state add column if not exists recipes jsonb not null default '{}'::jsonb;
alter table public.character_state add column if not exists stats_extra jsonb not null default '{}'::jsonb;

create index if not exists state_user on public.character_state (user_id);

-- ---------- 3. TABLA: CHAT GLOBAL PERSISTENTE ----------
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

-- ---------- 4. TABLA: HERMANDADES (Opcional para registro persistente) ----------
create table if not exists public.guilds (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique check (char_length(name) between 3 and 24),
  leader_id   uuid references auth.users(id) on delete set null,
  motd        text default '¡Gloria a Astra!',
  level       int not null default 1,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- ---------- 5. SEGURIDAD A NIVEL DE FILA (Row Level Security - RLS) ----------
alter table public.characters      enable row level security;
alter table public.character_state enable row level security;
alter table public.chat_messages   enable row level security;
alter table public.guilds          enable row level security;

-- Políticas para: characters
drop policy if exists "characters_select_all"  on public.characters;
drop policy if exists "characters_insert_own"  on public.characters;
drop policy if exists "characters_update_own"  on public.characters;
drop policy if exists "characters_delete_own"  on public.characters;

create policy "characters_select_all" on public.characters
  for select to anon, authenticated using (true);

create policy "characters_insert_own" on public.characters
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and (select count(*) from public.characters c where c.user_id = auth.uid()) < 6
  );

create policy "characters_update_own" on public.characters
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "characters_delete_own" on public.characters
  for delete to authenticated
  using (user_id = auth.uid());

-- Políticas para: character_state
drop policy if exists "state_select_own" on public.character_state;
drop policy if exists "state_insert_own" on public.character_state;
drop policy if exists "state_update_own" on public.character_state;
drop policy if exists "state_delete_own" on public.character_state;

create policy "state_select_own" on public.character_state
  for select to authenticated
  using (user_id = auth.uid());

create policy "state_insert_own" on public.character_state
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (select 1 from public.characters c where c.id = character_id and c.user_id = auth.uid())
  );

create policy "state_update_own" on public.character_state
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "state_delete_own" on public.character_state
  for delete to authenticated
  using (user_id = auth.uid());

-- Políticas para: chat_messages
drop policy if exists "chat_select_all" on public.chat_messages;
drop policy if exists "chat_insert_own" on public.chat_messages;

create policy "chat_select_all" on public.chat_messages
  for select to anon, authenticated using (true);

create policy "chat_insert_own" on public.chat_messages
  for insert to authenticated
  with check (user_id = auth.uid());

-- Políticas para: guilds
drop policy if exists "guilds_select_all" on public.guilds;
drop policy if exists "guilds_insert_own" on public.guilds;
create policy "guilds_select_all" on public.guilds
  for select to anon, authenticated using (true);
create policy "guilds_insert_own" on public.guilds
  for insert to authenticated with check (leader_id = auth.uid());

-- ---------- 6. PERMISOS Y ROLES (Grants) ----------
grant usage on schema public to anon, authenticated;

grant select on public.characters to anon, authenticated;
grant insert, update, delete on public.characters to authenticated;

grant select, insert, update, delete on public.character_state to authenticated;

grant select on public.chat_messages to anon, authenticated;
grant insert on public.chat_messages to authenticated;

grant select on public.guilds to anon, authenticated;
grant insert, update on public.guilds to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- ---------- 7. PUBLICACIÓN REALTIME (Opcional para chat en vivo) ----------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.chat_messages;
    exception when duplicate_object then
      null;
    end;
  end if;
end $$;
