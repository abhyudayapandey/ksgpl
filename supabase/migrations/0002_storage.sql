-- Storage buckets for product photos and company gallery/logo images.
-- Public read (so the catalog images load with no auth), admin-only write.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('company-images', 'company-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_admin_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

create policy "company_images_public_read" on storage.objects
  for select using (bucket_id = 'company-images');
create policy "company_images_admin_write" on storage.objects
  for insert with check (bucket_id = 'company-images' and public.is_admin());
create policy "company_images_admin_update" on storage.objects
  for update using (bucket_id = 'company-images' and public.is_admin());
create policy "company_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'company-images' and public.is_admin());
