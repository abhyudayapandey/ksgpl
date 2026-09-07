-- Dedupe visitor_leads by email: repeated visits (a different browser, a
-- cleared cache, a different device) should update that person's one lead
-- record instead of piling up duplicate rows, and should never error just
-- because a name/company field was typed slightly differently this time.

alter table public.visitor_leads
  add column if not exists updated_at timestamptz not null default now();

-- Plain (not expression) unique index on the raw column: the app normalizes
-- email to lowercase/trimmed before every write, so this is enough to
-- de-duplicate, and it's also what PostgREST's upsert onConflict targets.
create unique index if not exists visitor_leads_email_unique_idx
  on public.visitor_leads (email);

create or replace function public.visitor_leads_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists visitor_leads_before_update on public.visitor_leads;
create trigger visitor_leads_before_update
  before update on public.visitor_leads
  for each row execute function public.visitor_leads_set_updated_at();

-- Upserting on conflict needs update rights on the conflicting row, on top
-- of the existing insert-anyone policy. Still no real identity check here —
-- consistent with the rest of this gate being deliberately low-friction,
-- not real authentication.
drop policy if exists "visitor_leads_update_anyone" on public.visitor_leads;
create policy "visitor_leads_update_anyone" on public.visitor_leads
  for update using (true) with check (true);

-- Lets a returning visitor look up their own previously-entered details by
-- email alone, so a new browser/device doesn't force retyping everything.
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
  where lower(email) = lower(check_email)
  limit 1;
$$;

grant execute on function public.get_visitor_lead_by_email(text) to anon, authenticated;
