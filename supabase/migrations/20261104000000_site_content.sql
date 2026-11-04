-- Content for the public site, edited from /admin.
-- Anyone may read published rows (the site reads with the publishable key);
-- only signed-in users whose app_metadata.role is "admin" may read drafts or write.
-- Translated fields are jsonb objects: {"en": ..., "id": ..., "fr": ...}; "en" is required.

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- One row only.
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  business_name text not null,
  site_url text not null,
  whatsapp_number text not null check (whatsapp_number ~ '^[0-9]{8,15}$'),
  phone_display text not null,
  email text not null,
  address text not null,
  google_rating text not null,
  google_reviews_url text not null,
  instagram_url text not null,
  idr_per_usd integer not null check (idr_per_usd > 0),
  updated_at timestamptz not null default now()
);

create table public.tours (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  code text not null,
  length text not null check (length in ('day-trip', 'multi-day')),
  interests text[] not null default '{}'
    check (interests <@ array['temples', 'culture', 'nature', 'adventure']),
  price_from_idr integer check (price_from_idr > 0),
  -- R2 object key, or a path under /public for the photos bundled with the site.
  photo text,
  photo_credit jsonb,
  text jsonb not null check (text ? 'en'),
  position integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.vehicles (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  seats text not null,
  max_passengers integer not null check (max_passengers > 0),
  day_with_driver_idr integer not null check (day_with_driver_idr > 0),
  day_with_driver_and_fuel_idr integer not null check (day_with_driver_and_fuel_idr > 0),
  -- All three null when the car isn't offered for transfers.
  transfer_base_idr integer check (transfer_base_idr >= 0),
  transfer_per_km_idr integer check (transfer_per_km_idr >= 0),
  transfer_minimum_idr integer check (transfer_minimum_idr >= 0),
  position integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  check (
    (transfer_base_idr is null and transfer_per_km_idr is null and transfer_minimum_idr is null)
    or (transfer_base_idr is not null and transfer_per_km_idr is not null and transfer_minimum_idr is not null)
  )
);

create table public.places (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind text not null check (kind in ('airport', 'city', 'around', 'java', 'sight')),
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  name jsonb not null check (name ? 'en'),
  position integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.popular_routes (
  id uuid primary key default gen_random_uuid(),
  from_place text not null references public.places (id) on update cascade on delete cascade,
  to_place text not null references public.places (id) on update cascade on delete cascade,
  position integer not null default 0,
  check (from_place <> to_place),
  unique (from_place, to_place)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  origin jsonb not null check (origin ? 'en'),
  quote jsonb not null check (quote ? 'en'),
  tour_slug text references public.tours (slug) on update cascade on delete set null,
  position integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question jsonb not null check (question ? 'en'),
  answer jsonb not null check (answer ? 'en'),
  position integer not null default 0,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Edits to the page text in src/i18n/dictionaries, e.g. ('fr', 'hero.title', 'Yogyakarta').
create table public.page_text (
  locale text not null check (locale in ('en', 'id', 'fr')),
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (locale, key)
);

create trigger touch before update on public.site_settings for each row execute function public.touch_updated_at();
create trigger touch before update on public.tours for each row execute function public.touch_updated_at();
create trigger touch before update on public.vehicles for each row execute function public.touch_updated_at();
create trigger touch before update on public.places for each row execute function public.touch_updated_at();
create trigger touch before update on public.reviews for each row execute function public.touch_updated_at();
create trigger touch before update on public.faqs for each row execute function public.touch_updated_at();
create trigger touch before update on public.page_text for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;
alter table public.tours enable row level security;
alter table public.vehicles enable row level security;
alter table public.places enable row level security;
alter table public.popular_routes enable row level security;
alter table public.reviews enable row level security;
alter table public.faqs enable row level security;
alter table public.page_text enable row level security;

create policy "read" on public.site_settings for select using (true);
create policy "read" on public.popular_routes for select using (true);
create policy "read" on public.page_text for select using (true);
create policy "read published" on public.tours for select using (published or public.is_admin());
create policy "read published" on public.vehicles for select using (published or public.is_admin());
create policy "read published" on public.places for select using (published or public.is_admin());
create policy "read published" on public.reviews for select using (published or public.is_admin());
create policy "read published" on public.faqs for select using (published or public.is_admin());

create policy "admin writes" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin writes" on public.tours for all using (public.is_admin()) with check (public.is_admin());
create policy "admin writes" on public.vehicles for all using (public.is_admin()) with check (public.is_admin());
create policy "admin writes" on public.places for all using (public.is_admin()) with check (public.is_admin());
create policy "admin writes" on public.popular_routes for all using (public.is_admin()) with check (public.is_admin());
create policy "admin writes" on public.reviews for all using (public.is_admin()) with check (public.is_admin());
create policy "admin writes" on public.faqs for all using (public.is_admin()) with check (public.is_admin());
create policy "admin writes" on public.page_text for all using (public.is_admin()) with check (public.is_admin());
