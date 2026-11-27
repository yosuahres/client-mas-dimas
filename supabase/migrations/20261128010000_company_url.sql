-- The company's own website, which the company name in the footer links to. Empty shows the name without a link.
alter table public.site_settings add column company_url text not null default '';

update public.site_settings set company_url = 'https://www.jogja-transport.com' where id = 1;
