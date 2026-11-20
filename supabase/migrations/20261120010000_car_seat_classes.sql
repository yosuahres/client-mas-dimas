-- Seat groups: guests are offered cars by group (5 seater, 7 seater, above 7) rather than one by one,
-- the smallest group their party fits in plus the next one up. Set per car in /admin/fleet.
-- Avanza and Xenia count as the 5 seater (decided 2026-11-20); other cars are grouped by their passengers.

alter table public.vehicles
  add column seat_class text not null default 'seven' check (seat_class in ('five', 'seven', 'large'));

update public.vehicles
set seat_class = case
  when id in ('avanza', 'xenia') then 'five'
  when max_passengers > 7 then 'large'
  else 'seven'
end;
