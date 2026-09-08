-- Fixes two real production bugs, both caused by exact-string email matching:
--
-- 1. is_admin_email() compared `email = check_email` verbatim against
--    profiles.email. The app always calls it with a lower/trimmed email, but
--    profiles.email is copied as-is from auth.users at signup time (whatever
--    case was typed into the Supabase dashboard's "Add user" form). Any
--    casing mismatch meant an admin's own email silently failed the check,
--    so the Admin menu never appeared even after role was set to 'admin'.
--
-- 2. visitor_leads' unique index was on the raw email column. Two rows for
--    "the same" email in different casing/whitespace (e.g. one entered
--    before this app's own lowercase-normalization existed, another entered
--    later) don't collide on that index, so ON CONFLICT silently inserted a
--    second row instead of updating the first — producing duplicate leads.
--
-- This migration normalizes existing data, dedupes existing duplicate
-- visitor_leads rows, and moves matching everywhere to lower(trim(...)).

update public.visitor_leads
set email = lower(trim(email))
where email <> lower(trim(email));

update public.profiles
set email = lower(trim(email))
where email is not null and email <> lower(trim(email));

-- Keep the most recently updated row per normalized email, drop the rest.
with ranked as (
  select id,
         row_number() over (
           partition by lower(trim(email))
           order by updated_at desc, created_at desc
         ) as rn
  from public.visitor_leads
)
delete from public.visitor_leads
where id in (select id from ranked where rn > 1);

drop index if exists public.visitor_leads_email_unique_idx;
create unique index if not exists visitor_leads_email_unique_idx
  on public.visitor_leads (lower(trim(email)));

create or replace function public.upsert_visitor_lead(
  p_name text,
  p_company_name text,
  p_phone_country_code text,
  p_phone_number text,
  p_email text
)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.visitor_leads (name, company_name, phone_country_code, phone_number, email)
  values (p_name, p_company_name, p_phone_country_code, p_phone_number, lower(trim(p_email)))
  on conflict (lower(trim(email))) do update
    set name = excluded.name,
        company_name = excluded.company_name,
        phone_country_code = excluded.phone_country_code,
        phone_number = excluded.phone_number,
        email = excluded.email;
end;
$$;

create or replace function public.get_visitor_lead_by_email(check_email text)
returns table (
  name text,
  company_name text,
  phone_country_code text,
  phone_number text
)
language sql
security definer set search_path = public
stable
as $$
  select name, company_name, phone_country_code, phone_number
  from public.visitor_leads
  where lower(trim(email)) = lower(trim(check_email))
  limit 1;
$$;

create or replace function public.is_admin_email(check_email text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where lower(trim(email)) = lower(trim(check_email)) and role = 'admin'
  );
$$;
