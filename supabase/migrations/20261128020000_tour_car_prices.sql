-- Package prices are fixed per car, typed per package in /admin/tours. They replace the single cheapest-car price
-- (price_from_idr) and each car's price level (vehicles.tour_price_percent), which are turned into fixed prices
-- here, rounded up to the next 10,000 rupiah as the site did, so guests keep seeing the same prices.
--   car_prices:  {"avanza": 550000, "hiace": 1190000}, the whole package, transport only, by car id.
--   part_prices: one such object per split option, in the order of text.<locale>.parts.
-- A car left out of a package shows "Hubungi kami" for it.
--
-- Safe to run again, and on a database that already has car_prices from an earlier draft of this file: prices
-- already in car_prices are kept, and the conversion only runs while the old columns are still there.

alter table public.tours
  add column if not exists car_prices jsonb not null default '{}'::jsonb check (jsonb_typeof(car_prices) = 'object');

do $$
begin
  if exists (
    select from information_schema.columns
    where table_schema = 'public' and table_name = 'tours' and column_name = 'price_from_idr'
  ) then
    -- Worked-out prices for every car, with any price already typed for a car taking its place.
    update public.tours as tour
    set car_prices = coalesce((
      select jsonb_object_agg(vehicle.id, (ceil(tour.price_from_idr * vehicle.tour_price_percent / 100.0 / 10000) * 10000)::bigint)
      from public.vehicles as vehicle
    ), '{}'::jsonb) || tour.car_prices
    where tour.price_from_idr is not null;

    update public.tours as tour
    set part_prices = coalesce((
      select jsonb_agg(
        case jsonb_typeof(part.price)
          when 'number' then coalesce((
            select jsonb_object_agg(vehicle.id, (ceil(part.price::numeric * vehicle.tour_price_percent / 100.0 / 10000) * 10000)::bigint)
            from public.vehicles as vehicle
          ), '{}'::jsonb)
          when 'object' then part.price
          else '{}'::jsonb
        end
        order by part.position
      )
      from jsonb_array_elements(tour.part_prices) with ordinality as part(price, position)
    ), '[]'::jsonb);

    alter table public.tours drop column price_from_idr;
    alter table public.vehicles drop column tour_price_percent;
  end if;
end
$$;
