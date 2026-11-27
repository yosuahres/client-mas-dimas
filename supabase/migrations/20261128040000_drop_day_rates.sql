-- The cars' day rates (with driver, and with driver and fuel) only ever worked out the package price level, which
-- is gone: package and transfer prices are now typed per car. Nothing on the website showed them.
alter table public.vehicles
  drop column if exists day_with_driver_idr,
  drop column if exists day_with_driver_and_fuel_idr;
