-- The registered company behind the brand, shown in the footer ("Jogja Travel, operated by …") and given to Google
-- as the business's legalName. Empty hides the line.
alter table public.site_settings add column company_name text not null default '';

update public.site_settings set company_name = 'PT Jogja Transport Sukses Mandiri' where id = 1;
