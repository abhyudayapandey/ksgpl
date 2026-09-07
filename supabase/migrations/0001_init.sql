-- KSGPL Catalog POC — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users row, carries the admin/end_user role.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text not null default 'end_user' check (role in ('admin', 'end_user')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'end_user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper used inside RLS policies to check "is the current user an admin".
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- catalog_types: the tabs end users browse ("End Products", "Raw Materials", ...)
-- ---------------------------------------------------------------------------
create table if not exists public.catalog_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products: items within a catalog type, with a flexible spec sheet.
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  catalog_type_id uuid not null references public.catalog_types (id) on delete cascade,
  name text not null,
  category text,
  description text,
  image_url text,
  specs jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Flattened text of the specs jsonb, kept in sync by trigger below, so the
  -- shared query layer can ILIKE-search spec values with a plain column.
  specs_text text not null default ''
);

create index if not exists products_catalog_type_id_idx on public.products (catalog_type_id);
create index if not exists products_name_idx on public.products using gin (to_tsvector('simple', name));

create or replace function public.products_sync_specs_text()
returns trigger
language plpgsql
as $$
begin
  new.specs_text := coalesce(
    (select string_agg(coalesce(key, '') || ' ' || coalesce(value, ''), ' ')
     from jsonb_each_text(new.specs)),
    ''
  );
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_before_write on public.products;
create trigger products_before_write
  before insert or update on public.products
  for each row execute function public.products_sync_specs_text();

-- ---------------------------------------------------------------------------
-- company_info: singleton row describing the manufacturing company.
-- ---------------------------------------------------------------------------
create table if not exists public.company_info (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_name text,
  tagline text,
  description text,
  established_year integer,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  gallery_urls text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- Enforce at most one company_info row (simple singleton pattern).
create unique index if not exists company_info_singleton_idx on public.company_info ((true));

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.catalog_types enable row level security;
alter table public.products enable row level security;
alter table public.company_info enable row level security;

-- profiles: a user can read/update only their own row; admins can read all.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- catalog_types: readable by everyone (incl. anonymous end users), writable by admins only.
create policy "catalog_types_select_all" on public.catalog_types
  for select using (true);
create policy "catalog_types_admin_insert" on public.catalog_types
  for insert with check (public.is_admin());
create policy "catalog_types_admin_update" on public.catalog_types
  for update using (public.is_admin());
create policy "catalog_types_admin_delete" on public.catalog_types
  for delete using (public.is_admin());

-- products: active products readable by everyone; admins see + manage everything.
create policy "products_select_active_or_admin" on public.products
  for select using (is_active = true or public.is_admin());
create policy "products_admin_insert" on public.products
  for insert with check (public.is_admin());
create policy "products_admin_update" on public.products
  for update using (public.is_admin());
create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

-- company_info: readable by everyone, writable by admins only.
create policy "company_info_select_all" on public.company_info
  for select using (true);
create policy "company_info_admin_update" on public.company_info
  for update using (public.is_admin());
create policy "company_info_admin_insert" on public.company_info
  for insert with check (public.is_admin());
