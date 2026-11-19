-- Split packages: smaller versions of a package a guest can book instead ("Borobudur only" for
-- "Borobudur & Prambanan"). Their names live in the translated text, as text.<locale>.parts (same order in
-- every language); their transport-only prices, for the cheapest car, in part_prices at the same position
-- (null = on request).
--
-- Car capacity and price level: how many adults and children fit with and without luggage, and what a
-- package costs in this car compared with the cheapest one (100 = the package's listed price).
--
-- The numbers below are DUMMIES until the client confirms them; they're editable in /admin/tours and /admin/fleet.

alter table public.tours
  add column part_prices jsonb not null default '[]'::jsonb check (jsonb_typeof(part_prices) = 'array');

alter table public.vehicles
  add column max_passengers_with_luggage integer check (max_passengers_with_luggage > 0),
  add column tour_price_percent integer not null default 100 check (tour_price_percent between 50 and 1000);

update public.vehicles set max_passengers_with_luggage = max_passengers;

with capacity (id, with_luggage, percent) as (
  values
    ('avanza', 5, 100),
    ('xenia', 5, 100),
    ('innova-reborn', 6, 135),
    ('innova-zenix', 6, 150),
    ('hiace', 9, 215)
)
update public.vehicles as vehicle
set max_passengers_with_luggage = least(capacity.with_luggage, vehicle.max_passengers),
    tour_price_percent = capacity.percent
from capacity
where vehicle.id = capacity.id;

alter table public.vehicles alter column max_passengers_with_luggage set not null;

-- Dummy split options for the packages that join two places, added only where a package has none yet.
with parts (slug, prices, en, id, fr) as (
  values
    ('borobudur-prambanan', '[450000, 400000]'::jsonb,
      '["Borobudur only", "Prambanan only"]'::jsonb,
      '["Borobudur saja", "Prambanan saja"]'::jsonb,
      '["Borobudur seulement", "Prambanan seulement"]'::jsonb),
    ('borobudur-heritage', '[450000, 400000]'::jsonb,
      '["Borobudur only", "Yogyakarta heritage only"]'::jsonb,
      '["Borobudur saja", "Wisata sejarah Yogyakarta saja"]'::jsonb,
      '["Borobudur seulement", "Patrimoine de Yogyakarta seulement"]'::jsonb),
    ('jomblang-pindul', '[400000, 400000]'::jsonb,
      '["Jomblang Cave only", "Pindul Cave only"]'::jsonb,
      '["Goa Jomblang saja", "Goa Pindul saja"]'::jsonb,
      '["Grotte de Jomblang seulement", "Grotte de Pindul seulement"]'::jsonb),
    ('merapi-prambanan-ramayana', '[500000, 500000]'::jsonb,
      '["Merapi Lava Tour only", "Prambanan & Ramayana Ballet only"]'::jsonb,
      '["Lava Tour Merapi saja", "Prambanan & Sendratari Ramayana saja"]'::jsonb,
      '["Lava tour du Merapi seulement", "Prambanan & ballet du Ramayana seulement"]'::jsonb),
    ('bromo-madakaripura', '[2400000]'::jsonb, '["Bromo only"]'::jsonb, '["Bromo saja"]'::jsonb, '["Bromo seulement"]'::jsonb),
    ('ijen-baluran', '[3000000]'::jsonb, '["Ijen only"]'::jsonb, '["Ijen saja"]'::jsonb, '["Ijen seulement"]'::jsonb)
)
update public.tours as tour
set part_prices = parts.prices,
    text = (
      select jsonb_object_agg(
        locale,
        fields || jsonb_build_object('parts', case locale when 'en' then parts.en when 'id' then parts.id when 'fr' then parts.fr else '[]'::jsonb end)
      )
      from jsonb_each(tour.text) as entry(locale, fields)
    )
from parts
where tour.slug = parts.slug
  and tour.part_prices = '[]'::jsonb;
