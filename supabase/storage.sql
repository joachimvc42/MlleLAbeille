-- ============================================================================
-- MlleLAbeille — Storage buckets & policies
-- Execute THIRD (after rls.sql).
--
-- Buckets:
--   illustrations-originals  private  master artwork (PNG, ≤ 25 MB)
--   illustrations-web        public   optimized WebP/AVIF derivatives
--   product-mockups          public   product photos / mockups
--   personalization-uploads  private  future customer uploads (≤ 5 MB)
--
-- Path conventions:
--   illustrations-originals/<slug>/original.png
--   illustrations-web/<slug>/{full,card,thumb}.webp
--   product-mockups/<product-slug>/<n>.webp
--   personalization-uploads/<user_id>/<order-ref>/<file>
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('illustrations-originals', 'illustrations-originals', false, 26214400,
   array['image/png','image/jpeg','image/webp']),
  ('illustrations-web', 'illustrations-web', true, 5242880,
   array['image/webp','image/avif','image/png','image/jpeg']),
  ('product-mockups', 'product-mockups', true, 5242880,
   array['image/webp','image/avif','image/png','image/jpeg']),
  ('personalization-uploads', 'personalization-uploads', false, 5242880,
   array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do nothing;

-- Public buckets: anyone can read.
create policy "web images: public read"
  on storage.objects for select
  using (bucket_id in ('illustrations-web', 'product-mockups'));

-- Admin-managed content.
create policy "web images: admin write"
  on storage.objects for insert
  with check (
    bucket_id in ('illustrations-web', 'product-mockups', 'illustrations-originals')
    and public.is_admin()
  );

create policy "web images: admin update"
  on storage.objects for update
  using (
    bucket_id in ('illustrations-web', 'product-mockups', 'illustrations-originals')
    and public.is_admin()
  );

create policy "web images: admin delete"
  on storage.objects for delete
  using (
    bucket_id in ('illustrations-web', 'product-mockups', 'illustrations-originals')
    and public.is_admin()
  );

-- Originals: admin read only (service role bypasses RLS anyway).
create policy "originals: admin read"
  on storage.objects for select
  using (bucket_id = 'illustrations-originals' and public.is_admin());

-- Personalization uploads: each customer under their own folder.
create policy "perso uploads: own read"
  on storage.objects for select
  using (
    bucket_id = 'personalization-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "perso uploads: own insert"
  on storage.objects for insert
  with check (
    bucket_id = 'personalization-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "perso uploads: own delete"
  on storage.objects for delete
  using (
    bucket_id = 'personalization-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
