-- Photos on the home page the client can swap from /admin/home-photos: the big photo at the top, the four
-- interest tiles and the drivers feature. One row per replaced slot; a slot with no row shows the photo the
-- site launched with (for the top photo, the first package's photo). photo is a key in the photos bucket.

create table public.home_photos (
  slot text primary key check (slot in ('hero', 'temples', 'culture', 'nature', 'adventure', 'drivers')),
  photo text not null,
  updated_at timestamptz not null default now()
);

create trigger touch before update on public.home_photos for each row execute function public.touch_updated_at();

alter table public.home_photos enable row level security;

create policy "read" on public.home_photos for select using (true);
create policy "admin writes" on public.home_photos for all using (public.is_admin()) with check (public.is_admin());
