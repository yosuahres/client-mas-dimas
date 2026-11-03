import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { PageHeader } from "@/components/page-header";
import { ToursCatalog, ToursCatalogFromSearch } from "@/components/tour/tours-catalog";
import { languageAlternates } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getSite, getTours } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = (await getDictionary()).toursPage;
  return {
    title: t.title,
    description: t.metaDescription,
    alternates: languageAlternates(locale, "/tours"),
  };
}

export default async function ToursPage() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.toursPage;
  const [site, tours] = await Promise.all([getSite(), getTours(locale)]);
  const customLink = whatsappLink(site, dict.custom.message);
  const catalogProps = {
    tours,
    locale,
    text: dict.catalog,
    rowText: dict.tourRow,
    customLink,
  };

  return (
    <>
      <SiteHeader path="/tours" />
      <main>
        <PageHeader title={t.title} lede={t.lede} />

        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          {/* Prerendered unfiltered; picks up ?interest= from the landing page once in the browser */}
          <Suspense fallback={<ToursCatalog {...catalogProps} />}>
            <ToursCatalogFromSearch {...catalogProps} />
          </Suspense>

          <p className="mt-10 text-ink-muted">
            {t.cantFind}{" "}
            <a href={customLink} className="font-medium text-ink underline underline-offset-4">
              {dict.custom.link}
            </a>{" "}
            {dict.custom.after}
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
