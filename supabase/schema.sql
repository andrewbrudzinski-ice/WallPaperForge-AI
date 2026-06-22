-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  WallpaperForge AI — Database Schema (PostgreSQL / Supabase)            ║
-- ║                                                                        ║
-- ║  Run in the Supabase SQL editor, or via `supabase db push`.            ║
-- ║  Includes tables, indexes, Row Level Security, and helper functions.   ║
-- ╚══════════════════════════════════════════════════════════════════════╝

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
do $$ begin
  create type subscription_tier as enum ('free', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type generation_mode as enum ('random', 'prompt', 'surprise');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────
-- USERS
-- One row per auth user. Mirrors auth.users and holds app-level
-- profile + entitlement data.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text,
  display_name  text,
  tier          subscription_tier not null default 'free',
  -- When the premium subscription expires (null for free / lifetime).
  premium_until timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- DEVICES
-- A user's saved phone profile(s). One is marked active.
-- Safe-zone geometry is denormalized into JSONB so the catalog
-- can evolve without migrations; `device_key` references the
-- in-app device database id.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.devices (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  device_key    text not null,              -- e.g. 'iphone-16-pro-max'
  manufacturer  text not null,
  model         text not null,
  width         integer not null,
  height        integer not null,
  aspect_ratio  text not null,
  safe_zones    jsonb not null,             -- SafeZoneProfile
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists devices_user_idx on public.devices (user_id);
-- Only one active device per user.
create unique index if not exists devices_one_active_per_user
  on public.devices (user_id) where (is_active);

-- ─────────────────────────────────────────────────────────────
-- GENERATED WALLPAPERS
-- Every successfully generated image. `enhanced_prompt` is the
-- internal prompt (kept server-side / not surfaced in UI).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.generated_wallpapers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  device_id       uuid references public.devices (id) on delete set null,
  device_key      text not null,
  image_url       text not null,
  description     text not null,
  enhanced_prompt text not null,
  category        text,
  mode            generation_mode not null,
  provider        text not null,
  width           integer not null,
  height          integer not null,
  is_high_res     boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists wallpapers_user_idx
  on public.generated_wallpapers (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- FAVORITES
-- A user's favorited wallpapers (join table; unique per pair).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.favorites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  wallpaper_id  uuid not null references public.generated_wallpapers (id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (user_id, wallpaper_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id);

-- ─────────────────────────────────────────────────────────────
-- COLLECTIONS  (+ membership join table)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  name        text not null,
  cover_url   text,
  created_at  timestamptz not null default now()
);

create index if not exists collections_user_idx on public.collections (user_id);

create table if not exists public.collection_items (
  collection_id uuid not null references public.collections (id) on delete cascade,
  wallpaper_id  uuid not null references public.generated_wallpapers (id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (collection_id, wallpaper_id)
);

-- ─────────────────────────────────────────────────────────────
-- GENERATION HISTORY
-- Append-only log of generation events. Drives the daily free-tier
-- quota and the "history" screen. Separate from generated_wallpapers
-- so we can record attempts/usage even if an image is later deleted.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.generation_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  wallpaper_id  uuid references public.generated_wallpapers (id) on delete set null,
  mode          generation_mode not null,
  prompt        text,
  created_at    timestamptz not null default now()
);

create index if not exists history_user_day_idx
  on public.generation_history (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- HELPER: count today's generations for quota enforcement.
-- ─────────────────────────────────────────────────────────────
create or replace function public.generations_today(p_user uuid)
returns integer
language sql
stable
as $$
  select count(*)::int
  from public.generation_history
  where user_id = p_user
    and created_at >= date_trunc('day', now() at time zone 'utc');
$$;

-- ─────────────────────────────────────────────────────────────
-- TRIGGER: auto-create a public.users row when an auth user signs up.
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Each user can only see and mutate their own rows.
-- ─────────────────────────────────────────────────────────────
alter table public.users                enable row level security;
alter table public.devices              enable row level security;
alter table public.generated_wallpapers enable row level security;
alter table public.favorites            enable row level security;
alter table public.collections          enable row level security;
alter table public.collection_items     enable row level security;
alter table public.generation_history   enable row level security;

-- users
drop policy if exists "users self" on public.users;
create policy "users self" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- devices
drop policy if exists "devices owner" on public.devices;
create policy "devices owner" on public.devices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- generated_wallpapers
drop policy if exists "wallpapers owner" on public.generated_wallpapers;
create policy "wallpapers owner" on public.generated_wallpapers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- favorites
drop policy if exists "favorites owner" on public.favorites;
create policy "favorites owner" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- collections
drop policy if exists "collections owner" on public.collections;
create policy "collections owner" on public.collections
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- collection_items (scoped through the parent collection)
drop policy if exists "collection items owner" on public.collection_items;
create policy "collection items owner" on public.collection_items
  for all using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

-- generation_history
drop policy if exists "history owner" on public.generation_history;
create policy "history owner" on public.generation_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
