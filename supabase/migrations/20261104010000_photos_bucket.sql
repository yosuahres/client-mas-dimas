-- Photos uploaded from /admin, stored in Supabase Storage. tours.photo holds the object key ("tours/9f2c….webp").
-- The bucket is public, so the site serves photos straight from their public URL; only admins may add or remove them.
-- The browser compresses photos to WebP before upload, so anything else (or anything large) is refused.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/webp'])
on conflict (id) do nothing;

create policy "admins add photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.is_admin());
-- Deleting needs read access to the row as well.
create policy "admins read photos" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.is_admin());
create policy "admins delete photos" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_admin());
