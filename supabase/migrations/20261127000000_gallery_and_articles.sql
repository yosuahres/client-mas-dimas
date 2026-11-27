-- The Gallery page (/gallery) and the articles (/articles), both edited from the admin panel.
-- Photos are keys in the photos bucket ("gallery/<uuid>.webp", "articles/<uuid>.webp").

-- Guest photos in one grid, in the order set in /admin/gallery. The caption is optional: every language may be empty.
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  photo text not null,
  caption jsonb not null default '{"en": ""}' check (caption ? 'en'),
  position integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Trip stories and travel tips, newest first by published_on. text holds the title, excerpt and body per language;
-- photos are extra photos shown under the body.
create table public.articles (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  text jsonb not null check (text ? 'en'),
  cover text,
  photos text[] not null default '{}',
  published_on date not null default current_date,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger touch before update on public.gallery_photos for each row execute function public.touch_updated_at();
create trigger touch before update on public.articles for each row execute function public.touch_updated_at();

alter table public.gallery_photos enable row level security;
alter table public.articles enable row level security;

create policy "read published" on public.gallery_photos for select using (published or public.is_admin());
create policy "read published" on public.articles for select using (published or public.is_admin());
create policy "admin writes" on public.gallery_photos for all using (public.is_admin()) with check (public.is_admin());
create policy "admin writes" on public.articles for all using (public.is_admin()) with check (public.is_admin());
