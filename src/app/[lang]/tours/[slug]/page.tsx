import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { BookingCard, BookingCardFromSearch } from "@/components/tour/booking-card";
import { PriceTeaser } from "@/components/tour/tour-row";
import { languageAlternates, localePath } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { getFleet, getSite, getTour, getTours } from "@/lib/content/public";
import { formatIdr } from "@/lib/money";
import { jsonLdScript, tourJsonLd } from "@/lib/structured-data";
import { tourHref } from "@/lib/tours";

// Prerenders the packages published at build time. Packages added later in the admin panel render on their
// first visit and are cached from then on. "navigation" makes that first visit wait for the whole page instead of
// streaming the shell, so an unknown slug's notFound() still answers with a real 404 status.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  return (await getTours("en")).map((tour) => ({ slug: tour.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tours/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const tour = await getTour(locale, slug);
  if (!tour) return {};
  return {
    title: tour.name,
    description: tour.summary,
    alternates: languageAlternates(locale, `/tours/${tour.slug}`),
  };
}

export default async function TourPage({ params }: PageProps<"/[lang]/tours/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.tourPage;
  const [tour, tours, fleet, site] = await Promise.all([getTour(locale, slug), getTours(locale), getFleet(), getSite()]);
  if (!tour) notFound();

  const otherTours = tours
    .filter((other) => other.slug !== tour.slug)
    .slice(0, 4);
  const multiDay = tour.length === "multi-day";
  const included = [
    ...t.includedItems,
    ...(multiDay ? [t.includedMultiDay] : []),
    ...(tour.accommodationOffered ? [t.includedAccommodation] : []),
  ];
  const excluded = [
    ...t.excludedItems,
    ...(tour.accommodationOffered ? [t.excludedAccommodation] : multiDay ? [t.excludedMultiDay] : []),
  ];
  const dropOffs = tour.dropOffs.length > 0 ? tour.dropOffs : [t.dropOffDefault];
  const priceLabel = (price: number | null, template: string) =>
    price === null ? t.onRequest : fill(template, { price: formatIdr(price, locale) });
  const priceFacts = tour.accommodationOffered
    ? [
        { label: dict.catalog.stays.transport, value: priceLabel(tour.priceFromIdr, t.fromPrice) },
        { label: dict.catalog.stays.accommodation, value: priceLabel(tour.accommodationPriceFromIdr, t.fromPriceAccommodation) },
      ]
    : [{ label: t.price, value: priceLabel(tour.priceFromIdr, t.fromPrice) }];
  const bookingProps = {
    tourName: tour.name,
    priceFromIdr: tour.priceFromIdr,
    accommodationPriceFromIdr: tour.accommodationOffered ? tour.accommodationPriceFromIdr : undefined,
    dropOffs,
    locale,
    text: dict.bookingCard,
    pickerText: dict.pickers,
    stayText: dict.catalog.stays,
    priceText: { fromPrice: t.fromPrice, fromPriceAccommodation: t.fromPriceAccommodation, onRequest: t.onRequest },
    fleet: fleet.map(({ id, name, seats }) => ({ id, name, seats })),
    site: { whatsappNumber: site.whatsappNumber, idrPerUsd: site.idrPerUsd },
  };

  const jsonLd = tourJsonLd({ site, locale, tour, catalogName: dict.toursPage.title });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <SiteHeader path={`/tours/${tour.slug}`} />
      <main>
        <section aria-labelledby="tour-title" className="px-3 pt-3">
          <div className="relative isolate mx-auto flex min-h-[max(32rem,68svh)] max-w-[90rem] items-end overflow-hidden rounded-3xl bg-ink text-white">
          {tour.photo ? (
            <Image src={tour.photo} alt={tour.photoAlt} priority fill sizes="100vw" className="-z-10 object-cover" />
          ) : null}
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/75 via-black/25 to-black/5" />

          <div className="w-full px-5 pt-28 pb-10 sm:px-8 sm:pb-14 lg:px-12">
            <Link href={localePath(locale, "/tours")} className="pill bg-white/15 px-4 py-2 text-[0.9rem] text-white backdrop-blur-md hover:bg-white/25">
              ← {t.allTours}
            </Link>
            <h1 id="tour-title" className="display mt-8 max-w-5xl text-[clamp(2.75rem,6.5vw,5.5rem)]">
              {tour.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lede text-white/90">{tour.summary}</p>

            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="label text-white/65">{t.duration}</dt>
                <dd className="mt-1 font-medium">{tour.duration}</dd>
              </div>
              <div>
                <dt className="label text-white/65">{t.pickup}</dt>
                <dd className="mt-1 font-medium">{t.pickupValue}</dd>
              </div>
              <div>
                <dt className="label text-white/65">{t.dropOff}</dt>
                <dd className="mt-1 font-medium">
                  {dropOffs.length > 1 ? fill(t.dropOffChoice, { count: dropOffs.length }) : dropOffs[0]}
                </dd>
              </div>
              {priceFacts.map((fact) => (
                <div key={fact.label}>
                  <dt className="label text-white/65">{fact.label}</dt>
                  <dd className="mt-1 font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-14 lg:col-span-7">
            <section aria-labelledby="destinations-title">
              <h2 id="destinations-title" className="display text-[clamp(2rem,3.5vw,2.75rem)]">
                {t.destinations}
              </h2>
              <ol className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                {tour.destinations.map((destination, index) => (
                  <li key={destination} className="flex items-baseline gap-5 py-4">
                    <span className="label w-6 shrink-0 text-ink-muted tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-xl tracking-[-0.01em]">{destination}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="drop-offs-title">
              <h2 id="drop-offs-title" className="display text-[clamp(2rem,3.5vw,2.75rem)]">
                {t.dropOffs}
              </h2>
              <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                {dropOffs.map((place) => (
                  <li key={place} className="flex items-baseline gap-5 py-4">
                    <span aria-hidden="true" className="w-6 shrink-0 text-jade">
                      →
                    </span>
                    <span className="text-xl tracking-[-0.01em]">{place}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="included-title" className="grid gap-10 sm:grid-cols-2">
              <div>
                <h2 id="included-title" className="text-lg font-medium">
                  {t.included}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {included.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="font-medium text-jade">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-lg font-medium">{t.notIncluded}</h2>
                <ul className="mt-4 space-y-2.5 text-ink-muted">
                  {excluded.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true">–</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <aside aria-label={dict.bookingCard.title} className="order-first lg:order-none lg:col-span-5">
            <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.25)] sm:p-8 lg:sticky lg:top-6">
              <h2 className="label text-ink-muted">{dict.bookingCard.title}</h2>
              <div className="mt-4">
                {/* Prerendered without a date; picks up ?date= from the search box once in the browser */}
                <Suspense fallback={<BookingCard {...bookingProps} />}>
                  <BookingCardFromSearch {...bookingProps} />
                </Suspense>
              </div>
            </div>
          </aside>
        </div>

        <section aria-labelledby="more-title" className="px-3 pb-3">
          <div className="mx-auto max-w-[90rem] rounded-3xl bg-cream px-5 py-16 sm:px-12 sm:py-20">
            <h2 id="more-title" className="display text-[clamp(2rem,3.5vw,2.75rem)]">
              {t.otherTours}
            </h2>
            <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {otherTours.map((other) => (
                <li key={other.slug}>
                  <Link href={tourHref(locale, other)} className="group block">
                    <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-sand">
                      {other.photo ? (
                        <Image
                          src={other.photo}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-lg leading-snug font-medium group-hover:underline group-hover:underline-offset-4">
                      {other.name}
                    </h3>
                    <div className="mt-2">
                      <PriceTeaser text={dict.tourRow} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
