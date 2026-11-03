import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { WhatsappIcon } from "@/components/icons";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { PageHeader } from "@/components/page-header";
import { TripSearch } from "@/components/search/trip-search";
import { intlLocale, languageAlternates, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, formatDuration } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { getPlaces, getPopularRoutes, getSite, getTours, getTransferVehicles } from "@/lib/content/public";
import { formatApproxUsd, formatIdr } from "@/lib/money";
import { whatsappLink, type SiteSettings } from "@/lib/site";
import {
  estimateRoute,
  findPlace,
  parseTransferSearch,
  quoteTransfer,
  transferHref,
  type Place,
  type PopularRoute,
  type TransferSearch,
  type TransferVehicle,
  type VehicleQuote,
} from "@/lib/transfers";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = (await getDictionary()).transferPage;
  return {
    title: t.title,
    description: t.metaDescription,
    alternates: languageAlternates(locale, "/transfer"),
  };
}

export default async function TransferPage({ searchParams }: PageProps<"/[lang]/transfer">) {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.transferPage;
  const [tours, places, vehicles, routes, site] = await Promise.all([
    getTours(locale),
    getPlaces(locale),
    getTransferVehicles(),
    getPopularRoutes(),
    getSite(),
  ]);
  const searchProps = {
    locale,
    text: dict.search,
    transferText: dict.transfer,
    tours: tours.map(({ slug, name, destinations }) => ({ slug, name, destinations })),
    places,
    vehicles,
    defaultMode: "transfer" as const,
  };

  return (
    <>
      <SiteHeader path="/transfer" />
      <main>
        <PageHeader title={t.title} lede={t.lede} />

        <div className="mx-auto max-w-7xl px-3 pb-16 sm:px-8 sm:pb-20">
          {/* The URL holds the search, so only this part waits for the request; the rest is prerendered */}
          <Suspense fallback={<SearchOnEdge><TripSearch {...searchProps} /></SearchOnEdge>}>
            {searchParams.then((params) => {
              const search = parseTransferSearch(params, places);
              return (
                <>
                  <SearchOnEdge>
                    {/* key resets the form when a new search arrives */}
                    <TripSearch key={JSON.stringify(search)} {...searchProps} defaultTransfer={search} />
                  </SearchOnEdge>
                  <div className="px-2 sm:px-0">
                    {search ? (
                      <TransferResults search={search} places={places} vehicles={vehicles} site={site} locale={locale} dict={dict} />
                    ) : (
                      <div className="mt-14">
                        <h2 className="text-2xl font-medium">{t.emptyTitle}</h2>
                        <p className="mt-2 max-w-prose text-ink-muted">{t.emptyBody}</p>
                      </div>
                    )}
                  </div>
                </>
              );
            })}
          </Suspense>

          <div className="px-2 sm:px-0">
            <PopularRoutes routes={routes} places={places} vehicles={vehicles} locale={locale} dict={dict} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function SearchOnEdge({ children }: { children: ReactNode }) {
  return <div className="relative z-10 -mt-10 sm:-mt-12">{children}</div>;
}

type ResultsProps = {
  search: TransferSearch;
  places: Place[];
  vehicles: TransferVehicle[];
  site: SiteSettings;
  locale: Locale;
  dict: Dictionary;
};

/** A searched transfer with both ends looked up. */
type Trip = { search: TransferSearch; from: Place; to: Place };

function TransferResults({ search, places, vehicles, site, locale, dict }: ResultsProps) {
  const t = dict.transferPage;
  // parseTransferSearch only accepts ids from this list, so both ends are found
  const trip: Trip = { search, from: findPlace(places, search.from)!, to: findPlace(places, search.to)! };
  const route = estimateRoute(trip.from, trip.to);
  const quotes = quoteTransfer(vehicles, route.distanceKm);

  const when = [search.date ? formatDate(search.date, locale) : null, search.time].filter(Boolean).join(", ");
  const facts = [
    fill(t.distance, { km: route.distanceKm }),
    fill(t.duration, { duration: formatDuration(route.minutes, dict.transfer.duration) }),
    when || null,
  ].filter(Boolean);

  return (
    <section aria-labelledby="results-title" className="mt-14">
      <h2 id="results-title" className="text-[clamp(1.8rem,3.5vw,2.6rem)] leading-tight font-medium tracking-[-0.03em]">
        {fill(t.resultsTitle, { from: trip.from.name, to: trip.to.name })}
      </h2>
      <p className="mt-2 text-ink-muted">{facts.join(" · ")}</p>

      <ul className="mt-8 divide-y divide-sand border-y border-sand">
        {quotes.map((quote) => (
          <li key={quote.vehicle}>
            <VehicleRow quote={quote} trip={trip} site={site} locale={locale} dict={dict} />
          </li>
        ))}
      </ul>

      <div className="mt-6 max-w-prose border-l-[3px] border-gold pl-4">
        <p className="font-medium">{t.estimateTitle}</p>
        <p className="mt-1 text-[0.95rem] text-ink-muted">{t.estimateBody}</p>
      </div>
    </section>
  );
}

type VehicleRowProps = Pick<ResultsProps, "site" | "locale" | "dict"> & { quote: VehicleQuote; trip: Trip };

function VehicleRow({ quote, trip, site, locale, dict }: VehicleRowProps) {
  const t = dict.transferPage;
  return (
    <article className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center lg:grid-cols-[1.2fr_1fr_auto_auto] lg:gap-10">
      <div>
        <h3 className="text-xl font-medium">{quote.name}</h3>
      </div>
      <p className="text-[0.95rem] text-ink-muted sm:col-start-1 lg:col-start-auto">
        {fill(dict.transfer.seats, { seats: quote.seats })}
      </p>
      <p className="sm:row-span-2 sm:row-start-1 sm:col-start-2 sm:text-right lg:row-auto lg:col-start-auto">
        <span className="block text-2xl font-medium tabular-nums">{formatIdr(quote.totalIdr, locale)}</span>
        <span className="text-[0.95rem] text-ink-muted">
          {t.perCar}, ≈ {formatApproxUsd(quote.totalIdr, locale, site.idrPerUsd)}
        </span>
      </p>
      <a
        href={whatsappLink(site, transferMessage(trip, quote, locale, dict))}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-medium whitespace-nowrap text-white hover:bg-ink/90 sm:col-span-2 sm:justify-self-start lg:col-span-1"
      >
        <WhatsappIcon className="size-[1.1em] shrink-0" />
        {t.request}
      </a>
    </article>
  );
}

type PopularRoutesProps = Pick<ResultsProps, "places" | "vehicles" | "locale" | "dict"> & { routes: PopularRoute[] };

function PopularRoutes({ routes, places, vehicles, locale, dict }: PopularRoutesProps) {
  const t = dict.transferPage;
  return (
    <section aria-labelledby="popular-title" className="mt-16 border-t border-sand pt-12">
      <h2 id="popular-title" className="text-2xl font-medium">
        {t.popularTitle}
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => {
          // getPopularRoutes only returns routes whose both ends are published
          const from = findPlace(places, route.from)!;
          const to = findPlace(places, route.to)!;
          const { distanceKm, minutes } = estimateRoute(from, to);
          const [cheapest] = quoteTransfer(vehicles, distanceKm);
          return (
            <li key={`${route.from}-${route.to}`}>
              <Link
                href={transferHref(localePath(locale, "/transfer"), route)}
                className="flex h-full flex-col justify-between gap-4 rounded-2xl bg-cream p-5 hover:bg-sand"
              >
                <span className="font-medium">
                  {from.name} <span aria-hidden="true">→</span>
                  <span className="sr-only">–</span> {to.name}
                </span>
                <span className="text-[0.95rem] text-ink-muted">
                  {distanceKm} km · {formatDuration(minutes, dict.transfer.duration)}
                  <br />
                  <span className="font-medium text-ink tabular-nums">
                    {fill(t.popularPrice, { price: formatIdr(cheapest.totalIdr, locale) })}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function transferMessage({ search, from, to }: Trip, quote: VehicleQuote, locale: Locale, dict: Dictionary) {
  const t = dict.transferPage;
  return [
    t.messageIntro,
    fill(t.messageFrom, { place: from.name }),
    fill(t.messageTo, { place: to.name }),
    fill(t.messageDate, { date: search.date ? formatDate(search.date, locale) : t.messageUnknown }),
    fill(t.messageTime, { time: search.time ?? t.messageUnknown }),
    fill(t.messageVehicle, { vehicle: quote.name }),
    fill(t.messagePrice, { price: formatIdr(quote.totalIdr, locale) }),
  ].join("\n");
}

/** "Tue 3 Nov 2026" from "2026-11-03", without the server's time zone shifting the day. */
function formatDate(isoDate: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
