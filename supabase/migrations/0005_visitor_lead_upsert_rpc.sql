-- Fixes: client-side `.upsert(..., { onConflict: "email" })` from the app
-- kept failing with "new row violates row-level security policy" for every
-- returning visitor, admins included. Root cause: INSERT ... ON CONFLICT DO
-- UPDATE needs to see the pre-existing conflicting row to resolve the
-- conflict, and that visibility check is governed by the table's SELECT
-- policy (admin-only here), not the UPDATE policy — so the insert-anyone /
-- update-anyone policies never even got evaluated. Moving the write into a
-- SECURITY DEFINER function bypasses RLS entirely for its own internal
-- insert-or-update, sidestepping this regardless of the SELECT policy,
-- matching the same pattern already used by is_admin_email and
-- get_visitor_lead_by_email.

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
  values (p_name, p_company_name, p_phone_country_code, p_phone_number, p_email)
  on conflict (email) do update
    set name = excluded.name,
        company_name = excluded.company_name,
        phone_country_code = excluded.phone_country_code,
        phone_number = excluded.phone_number;
end;
$$;

grant execute on function public.upsert_visitor_lead(text, text, text, text, text) to anon, authenticated;
