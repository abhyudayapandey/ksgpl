-- Lightweight, no-password "gate" in front of the catalog: end users enter
-- name/company/phone/email (captured as a lead) before they can browse.
-- No Supabase Auth account is created for them — this is intentionally not
-- real authentication, just a details form + a way to recognize admins.

create table if not exists public.visitor_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text not null,
  phone_country_code text not null default '+91',
  phone_number text not null,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.visitor_leads enable row level security;

-- Anyone (including anonymous visitors) can submit the gate form.
create policy "visitor_leads_insert_anyone" on public.visitor_leads
  for insert with check (true);

-- Only admins can read the captured leads (e.g. via SQL editor for now).
create policy "visitor_leads_select_admin" on public.visitor_leads
  for select using (public.is_admin());

-- Lets the gate form check "does this email belong to an admin" (to decide
-- whether to show the Admin menu) without exposing the whole profiles
-- table to anonymous visitors.
create or replace function public.is_admin_email(check_email text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where email = check_email and role = 'admin'
  );
$$;

grant execute on function public.is_admin_email(text) to anon, authenticated;
