import { cacheLife } from "next/cache";
import Link from "next/link";
import type { ReactNode } from "react";

import { LogoMark, WhatsappIcon } from "@/components/icons";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getPhotoCredits, getSite, getTours } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";
import { tourHref } from "@/lib/tours";

// A rounded green call-to-action card, then a light footer.
export async function SiteFooter() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.footer;
  const nav = dict.header.nav;
  const [site, tours, photoCredits] = await Promise.all([getSite(), getTours(locale), getPhotoCredits()]);
  const pages = [
    { path: "/transfer", label: nav.transfers },
    { path: "/plan-your-visit", label: nav.plan },
    { path: "/how-to-book", label: nav.booking },
    { path: "/faq", label: nav.faq },
  ];

  return (
    <footer>
      <div className="px-3">
      <div className="mx-auto max-w-[90rem] rounded-3xl bg-jade text-white">
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

      <div className="text-ink">
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-10 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <Link href={localePath(locale)} className="flex items-center gap-2.5 text-[1.35rem] font-medium tracking-[-0.03em]">
                <LogoMark className="size-8 text-brand" />
                {site.businessName.toLowerCase()}
              </Link>
              {/* Laid out like a Jogja street sign: Latin name over aksara Jawa */}
              <div className="mt-8 inline-block rounded-2xl border border-ink/15 px-5 py-3 text-center">
                <p className="text-xl font-medium tracking-wide">Yogyakarta</p>
                <p lang="jv-Java" className="mt-1 font-javanese text-lg text-ink-muted">
                  ꦔꦪꦺꦴꦒꦾꦏꦂꦠ
                </p>
              </div>
            </div>

            <FooterColumn title={t.columns.tours} className="lg:col-span-3">
              {tours.map((tour) => (
                <li key={tour.slug}>
                  <Link href={tourHref(locale, tour)} className="hover:underline">
                    {tour.name}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title={t.columns.plan} className="lg:col-span-3">
              {pages.map((page) => (
                <li key={page.path}>
                  <Link href={localePath(locale, page.path)} className="hover:underline">
                    {page.label}
                  </Link>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title={t.columns.contact} className="lg:col-span-3">
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
              <li className="text-ink-muted">{site.address}</li>
            </FooterColumn>
          </div>

          <div className="mt-16 space-y-3 border-t border-ink/10 pt-8 text-[0.85rem] text-ink-muted">
            <p>
              {t.photos}{" "}
              {photoCredits.map((credit, index) => (
                <span key={credit.source}>
                  <a href={credit.source} className="underline underline-offset-2 hover:text-ink">
                    {credit.subject}
                  </a>{" "}
                  {t.by} {credit.author} ({credit.license}){index < photoCredits.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
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
