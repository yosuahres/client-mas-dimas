import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ReactNode, SVGProps } from "react";

import { LogoMark, WhatsappIcon } from "@/components/icons";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getSite, getTours } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";
import { tourHref } from "@/lib/tours";

// The most popular packages; the rest are one click away on /tours.
const FOOTER_TOUR_COUNT = 5;

// A rounded green call-to-action card, then a light footer (a dark one with folding rows on phones).
export async function SiteFooter() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.footer;
  const nav = dict.header.nav;
  const [site, tours] = await Promise.all([getSite(), getTours(locale)]);
  const pages = [
    { path: "/transfer", label: nav.transfers },
    { path: "/plan-your-visit", label: nav.plan },
    { path: "/how-to-book", label: nav.booking },
    { path: "/faq", label: nav.faq },
  ];

  const columns: { title: string; items: ReactNode; extra?: ReactNode }[] = [
    {
      title: t.columns.tours,
      items: (
        <>
          {tours.slice(0, FOOTER_TOUR_COUNT).map((tour) => (
            <li key={tour.slug}>
              <Link href={tourHref(locale, tour)} className="hover:underline">
                {tour.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href={localePath(locale, "/tours")} className="font-medium hover:underline">
              {dict.tourPage.allTours} →
            </Link>
          </li>
        </>
      ),
    },
    {
      title: t.columns.plan,
      items: pages.map((page) => (
        <li key={page.path}>
          <Link href={localePath(locale, page.path)} className="hover:underline">
            {page.label}
          </Link>
        </li>
      )),
    },
    {
      title: t.columns.contact,
      items: (
        <>
          <li>
            <a href={whatsappLink(site, t.message)} className="hover:underline">
              WhatsApp
            </a>
          </li>
          <li>
            <a href={`tel:+${site.whatsappNumber}`} className="hover:underline">
              {site.phoneDisplay}
            </a>
          </li>
          <li>
            <a href={`mailto:${site.email}`} className="break-all hover:underline">
              {site.email}
            </a>
          </li>
          <li>
            <a href={site.instagramUrl} className="hover:underline">
              Instagram
            </a>
          </li>
        </>
      ),
      // Phones show the address under the logo instead
      extra: <li className="text-ink-muted">{site.address}</li>,
    },
  ];

  return (
    <footer>
      <div className="sm:px-3">
      <div className="mx-auto max-w-[90rem] bg-jade text-white sm:rounded-3xl">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-24">
          <p className="kicker text-white/75">{t.sticker.join(" ")}</p>
          <h2 className="display mt-3 text-[clamp(2.25rem,4.5vw,3.5rem)]">{t.title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-[1.1rem] text-white/90">{t.lede}</p>
          <a href={whatsappLink(site, t.message)} className="pill mt-8 bg-white text-ink hover:bg-white/90">
            <WhatsappIcon className="size-4" />
            {t.cta}
          </a>
          <p className="mt-6 text-white/85">
            {t.orEmail}{" "}
            <a href={`mailto:${site.email}`} className="underline underline-offset-4">
              {site.email}
            </a>
          </p>
        </div>
      </div>
      </div>

      {/* Phones: a dark footer, Disney-style: each column folds into a row, then social icons, logo and copyright */}
      <div className="bg-linear-to-b from-[#10261f] to-jade px-5 pt-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-white sm:hidden">
        <div className="divide-y divide-white/12 border-b border-white/12">
          {columns.map((column) => (
            <details key={column.title} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-[1.1rem] font-medium [&::-webkit-details-marker]:hidden">
                {column.title}
                <ChevronDown className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <nav aria-label={column.title}>
                <ul className="space-y-3.5 pb-6 text-white/80 [&_a]:hover:text-white">{column.items}</ul>
              </nav>
            </details>
          ))}
        </div>

        <div className="flex justify-center gap-4 border-b border-white/12 py-8">
          <a
            href={whatsappLink(site, t.message)}
            aria-label="WhatsApp"
            className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <WhatsappIcon className="size-5" />
          </a>
          <a href={site.instagramUrl} aria-label="Instagram" className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
            <InstagramIcon className="size-5" />
          </a>
        </div>

        <div className="pt-9 text-center">
          <Link href={localePath(locale)} className="inline-flex items-center gap-2.5 text-[1.35rem] font-medium tracking-[-0.03em]">
            <LogoMark className="size-8 text-brand" />
            {site.businessName.toLowerCase()}
          </Link>
          <p className="mx-auto mt-4 max-w-xs text-[0.9rem] leading-relaxed text-white/70">{site.address}</p>
          <p className="mt-5 text-[0.85rem] text-white/60">
            © <CurrentYear /> {site.businessName}. {dict.meta.city}.
          </p>
        </div>
      </div>

      <div className="text-ink max-sm:hidden">
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <Link href={localePath(locale)} className="flex items-center gap-2.5 text-[1.35rem] font-medium tracking-[-0.03em]">
                <LogoMark className="size-8 text-brand" />
                {site.businessName.toLowerCase()}
              </Link>
            </div>

            {columns.map((column) => (
              <FooterColumn key={column.title} title={column.title} className="lg:col-span-3">
                {column.items}
                {column.extra}
              </FooterColumn>
            ))}
          </div>

          <div className="mt-16 space-y-3 border-t border-ink/10 pt-8 text-[0.85rem] text-ink-muted">
            <p>
              © <CurrentYear /> {site.businessName}. {dict.meta.city}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, className, children }: { title: string; className: string; children: ReactNode }) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="label text-ink-muted">{title}</h2>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </nav>
  );
}

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.5 6 8 10.5 12.5 6" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
