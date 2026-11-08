-- Two ways to book a package: transport only (price_from_idr) or with the hotel arranged
-- (accommodation_price_from_idr, null = on request). Drop-off points live in the translated text,
-- as text.<locale>.dropOffs: a list of lines, the first being the usual one; none means back in Jogja.

alter table public.tours
  add column accommodation_offered boolean not null default true,
  add column accommodation_price_from_idr integer check (accommodation_price_from_idr > 0);

-- The drop-offs the client asked for on the East Java packages (WhatsApp, 2026-11-08),
-- added only where the package doesn't have any yet. jsonb_set skips a language the package lacks.
with drop_offs (slug, locale, lines) as (
  values
    ('bromo-madakaripura', 'en', '["Back to your hotel in Jogja", "Juanda Airport, Surabaya", "Ketapang port, Banyuwangi, via Ijen crater, for the ferry to Bali"]'::jsonb),
    ('bromo-madakaripura', 'id', '["Kembali ke hotel Anda di Jogja", "Bandara Juanda, Surabaya", "Pelabuhan Ketapang, Banyuwangi, lewat Kawah Ijen, lanjut kapal ke Bali"]'::jsonb),
    ('bromo-madakaripura', 'fr', '["Retour à votre hôtel à Jogja", "Aéroport de Juanda, Surabaya", "Port de Ketapang, Banyuwangi, via le cratère de l''Ijen, pour le ferry vers Bali"]'::jsonb),
    ('tumpak-sewu', 'en', '["Back to your hotel in Jogja", "Juanda Airport, Surabaya", "Ketapang port, Banyuwangi, via Ijen crater, for the ferry to Bali"]'::jsonb),
    ('tumpak-sewu', 'id', '["Kembali ke hotel Anda di Jogja", "Bandara Juanda, Surabaya", "Pelabuhan Ketapang, Banyuwangi, lewat Kawah Ijen, lanjut kapal ke Bali"]'::jsonb),
    ('tumpak-sewu', 'fr', '["Retour à votre hôtel à Jogja", "Aéroport de Juanda, Surabaya", "Port de Ketapang, Banyuwangi, via le cratère de l''Ijen, pour le ferry vers Bali"]'::jsonb),
    ('ijen-baluran', 'en', '["Back to your hotel in Jogja", "Juanda Airport, Surabaya", "Ketapang port, Banyuwangi, for the ferry to Bali"]'::jsonb),
    ('ijen-baluran', 'id', '["Kembali ke hotel Anda di Jogja", "Bandara Juanda, Surabaya", "Pelabuhan Ketapang, Banyuwangi, lanjut kapal ke Bali"]'::jsonb),
    ('ijen-baluran', 'fr', '["Retour à votre hôtel à Jogja", "Aéroport de Juanda, Surabaya", "Port de Ketapang, Banyuwangi, pour le ferry vers Bali"]'::jsonb)
)
update public.tours as tour
set text = jsonb_set(tour.text, array[drop_offs.locale, 'dropOffs'], drop_offs.lines)
from drop_offs
where tour.slug = drop_offs.slug
  and tour.text ? drop_offs.locale
  and not (tour.text -> drop_offs.locale ? 'dropOffs');
