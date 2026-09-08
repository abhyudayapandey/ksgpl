-- Promote a user to admin after they've signed up once through the app
-- (Supabase Auth -> Users, or the app's sign-up flow) using their email.
-- Run this in the Supabase SQL editor.

update public.profiles
set role = 'admin'
where lower(trim(email)) = lower(trim('REPLACE_WITH_ADMIN_EMAIL@example.com'));
