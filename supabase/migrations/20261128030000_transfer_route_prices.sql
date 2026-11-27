-- Transfer prices are fixed per route and car, typed per route in /admin/transfers, like package prices. They
-- replace each car's per-km rate (vehicles.transfer_base_idr, transfer_per_km_idr, transfer_minimum_idr), which
-- is turned into fixed prices here for every popular route, with the distance the site estimated (straight line
-- × 1.35) and the price rounded up to the next 5,000 rupiah, so guests keep seeing the same prices.
--   car_prices: {"avanza": 250000, "hiace": 550000}, by car id. A price counts in both directions.
-- A trip between two places with no route, or a car left out, shows "Hubungi kami".
--
-- Safe to run again: prices already in car_prices are kept, and the conversion only runs while the per-km
-- columns are still there.

alter table public.popular_routes
  add column if not exists car_prices jsonb not null default '{}'::jsonb check (jsonb_typeof(car_prices) = 'object');

do $$
begin
  if exists (
    select from information_schema.columns
    where table_schema = 'public' and table_name = 'vehicles' and column_name = 'transfer_per_km_idr'
  ) then
    update public.popular_routes as route
    set car_prices = coalesce((
      select jsonb_object_agg(
        vehicle.id,
        (ceil(greatest(vehicle.transfer_minimum_idr, vehicle.transfer_base_idr + vehicle.transfer_per_km_idr * trip.km) / 5000.0) * 5000)::bigint
      )
      from public.vehicles as vehicle
      cross join (
        select greatest(1, round((2 * 6371 * asin(sqrt(
          sin(radians(b.lat - a.lat) / 2) ^ 2 + cos(radians(a.lat)) * cos(radians(b.lat)) * sin(radians(b.lng - a.lng) / 2) ^ 2
        )) * 1.35)::numeric)) as km
        from public.places as a, public.places as b
        where a.id = route.from_place and b.id = route.to_place
      ) as trip
      where vehicle.transfer_per_km_idr is not null
    ), '{}'::jsonb) || route.car_prices;

    alter table public.vehicles
      drop column transfer_base_idr,
      drop column transfer_per_km_idr,
      drop column transfer_minimum_idr;
  end if;
end
$$;
