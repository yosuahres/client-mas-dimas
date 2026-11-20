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
import { seatClasses, seatOptions, type SeatOption } from "@/lib/fleet";
import { defaultParty, describeParty, parsePartyParams, type Party } from "@/lib/party";
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
    pickerText: dict.pickers,
    tours: tours.map(({ slug, name }) => ({ slug, name })),
    places,
    defaultMode: "transfer" as const,
  };

  // A search in the link (from the home page or a popular route) goes straight to the prices: a short summary
  // of the trip with a Change button replaces the big header and the open form.
  const defaultView = (
    <>
      <PageHeader title={t.title} lede={t.lede} />
      <div className="mx-auto max-w-7xl px-3 sm:px-8">
        <SearchOnEdge>
          <TripSearch {...searchProps} />
        </SearchOnEdge>
        <div className="mt-14 px-2 sm:px-0">
          <h2 className="text-2xl font-medium">{t.emptyTitle}</h2>
          <p className="mt-2 max-w-prose text-ink-muted">{t.emptyBody}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <SiteHeader path="/transfer" />
      <main>
        {/* The URL holds the search, so only this part waits for the request; the rest is prerendered.
            While it waits, a skeleton of the results, not the plain page: a guest who just pressed See prices
            must land on their prices, not on the empty form */}
        <Suspense fallback={<ResultsSkeleton />}>
          {searchParams.then((params) => {
            const search = parseTransferSearch(params, places);
            if (!search) return defaultView;
            const party = parsePartyParams(params);
            // parseTransferSearch only accepts ids from this list, so both ends are found
            const trip: Trip = { search, party, from: findPlace(places, search.from)!, to: findPlace(places, search.to)! };
            return (
              <>
                <TripSummary trip={trip} locale={locale} dict={dict}>
                  {/* key resets the form when a new search arrives */}
                  <TripSearch key={JSON.stringify([search, party])} {...searchProps} defaultTransfer={search} defaultParty={party} />
                </TripSummary>
                <div className="mx-auto max-w-7xl px-5 sm:px-8">
                  <TransferResults trip={trip} vehicles={vehicles} site={site} locale={locale} dict={dict} />
                </div>
              </>
            );
          })}
        </Suspense>

        <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
          <PopularRoutes routes={routes} places={places} vehicles={vehicles} site={site} locale={locale} dict={dict} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div aria-hidden="true" className="motion-safe:animate-pulse">
      <div className="border-b border-ink/10 bg-cream">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-5 py-5 sm:px-8 sm:py-7">
          <div className="w-full max-w-xl">
            <div className="h-7 w-4/5 rounded-md bg-ink/10 sm:h-9" />
            <div className="mt-3 h-4 w-1/2 rounded-md bg-ink/10" />
          </div>
          <div className="h-10 w-24 shrink-0 rounded-full bg-white" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8 sm:pt-10">
        <div className="h-4 w-56 rounded-md bg-ink/10" />
        <div className="mt-4 divide-y divide-sand border-y border-sand">
          {[0, 1].map((row) => (
            <div key={row} className="flex flex-wrap items-center justify-between gap-4 py-6">
              <div>
                <div className="h-6 w-32 rounded-md bg-ink/10" />
                <div className="mt-2 h-4 w-44 rounded-md bg-ink/10" />
              </div>
              <div className="h-8 w-36 rounded-md bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SearchOnEdge({ children }: { children: ReactNode }) {
  return <div className="relative z-10 -mx-3 sm:mx-0 sm:-mt-12">{children}</div>;
}

/** A searched transfer with both ends looked up. */
type Trip = { search: TransferSearch; party: Party; from: Place; to: Place };

type SharedProps = {
  site: SiteSettings;
  locale: Locale;
  dict: Dictionary;
};

function partyLine(party: Party, locale: Locale, dict: Dictionary) {
  return describeParty(party, dict.pickers.party, locale) + (party.luggage ? `, ${dict.pickers.party.withLuggage}` : "");
}

// The searched trip in two lines, with the form folded behind Change, so the prices come first.
function TripSummary({ trip, locale, dict, children }: Omit<SharedProps, "site"> & { trip: Trip; children: ReactNode }) {
  const t = dict.transferPage;
  const { search, party } = trip;
  const when = [search.date ? formatDate(search.date, locale) : null, search.time].filter(Boolean);
  return (
    <section aria-labelledby="results-title" className="border-b border-ink/10 bg-cream">
      <div className="relative mx-auto max-w-7xl px-5 py-5 sm:px-8 sm:py-7 max-sm:has-[details[open]]:pb-0">
        <div className="pr-28">
          <h1 id="results-title" className="text-[clamp(1.35rem,3vw,2.2rem)] leading-tight font-medium tracking-[-0.02em]">
            {fill(t.resultsTitle, { from: trip.from.name, to: trip.to.name })}
          </h1>
          <p className="mt-1 text-[0.95rem] text-ink-muted">{[...when, partyLine(party, locale, dict)].join(" · ")}</p>
        </div>
        <details className="group">
          <summary className="pill absolute top-5 right-5 cursor-pointer list-none border border-ink/15 bg-white px-4 py-2.5 text-[0.9rem] hover:border-ink/40 sm:top-7 sm:right-8 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">{t.change}</span>
            <span className="hidden group-open:inline">{t.closeChange}</span>
          </summary>
          <div className="-mx-5 mt-5 sm:mx-0">{children}</div>
        </details>
      </div>
    </section>
  );
}

type ResultsProps = SharedProps & { trip: Trip; vehicles: TransferVehicle[] };

// One row per seat group: the smallest the party fits in and the next one up, each at its cheapest car.
function TransferResults({ trip, vehicles, site, locale, dict }: ResultsProps) {
  const t = dict.transferPage;
  const route = estimateRoute(trip.from, trip.to);
  const options = seatOptions(quoteTransfer(vehicles, route.distanceKm), trip.party, (quote) => quote.totalIdr);
  const facts = [fill(t.distance, { km: route.distanceKm }), fill(t.duration, { duration: formatDuration(route.minutes, dict.transfer.duration) })];

  return (
    <div className="pt-6 sm:pt-10">
      <p className="text-ink-muted">{facts.join(" · ")}</p>

      {options.length > 0 ? (
        <ul className="mt-4 divide-y divide-sand border-y border-sand">
          {options.map((option, index) => (
            <li key={option.seatClass}>
              <SeatGroupRow option={option} recommended={index === 0} trip={trip} site={site} locale={locale} dict={dict} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 font-medium text-clay">{dict.bookingCard.tooBig}</p>
      )}

      <BiggerVehicleNote site={site} dict={dict} />

      <div className="mt-6 max-w-prose border-l-[3px] border-gold pl-4">
        <p className="font-medium">{t.estimateTitle}</p>
        <p className="mt-1 text-[0.95rem] text-ink-muted">{t.estimateBody}</p>
      </div>
    </div>
  );
}

type SeatGroupRowProps = SharedProps & { option: SeatOption<VehicleQuote>; recommended: boolean; trip: Trip };

function SeatGroupRow({ option, recommended, trip, site, locale, dict }: SeatGroupRowProps) {
  const t = dict.transferPage;
  const label = dict.transfer.seatClasses[option.seatClass];
  const names = option.vehicles.map((quote) => quote.name).join(" / ");
  const price = option.vehicle.totalIdr;
  return (
    <article className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center lg:grid-cols-[1.5fr_auto_auto] lg:gap-10">
      <div className="min-w-0">
        <h2 className="text-xl font-medium">
          {label}
          {recommended ? <span className="ml-2.5 align-middle text-[0.9rem] font-medium text-jade">{t.recommended}</span> : null}
        </h2>
        <p className="mt-1 text-[0.95rem] text-ink-muted">{names}</p>
      </div>
      <p className="sm:row-span-2 sm:row-start-1 sm:col-start-2 sm:text-right lg:row-auto lg:col-start-auto">
        <span className="block text-2xl font-medium tabular-nums">{formatIdr(price, locale)}</span>
        <span className="text-[0.95rem] text-ink-muted">
          {t.perCar}, ≈ {formatApproxUsd(price, locale, site.idrPerUsd)}
        </span>
      </p>
      <a
        href={whatsappLink(site, transferMessage(trip, `${label} (${names})`, price, locale, dict))}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-medium whitespace-nowrap text-white hover:bg-ink/90 sm:col-span-2 sm:justify-self-start lg:col-span-1"
      >
        <WhatsappIcon className="size-[1.1em] shrink-0" />
        {t.request}
      </a>
    </article>
  );
}

/** The fleet stops at the cars set up for transfers; bigger groups ask for a price. */
function BiggerVehicleNote({ site, dict }: Pick<SharedProps, "site" | "dict">) {
  const t = dict.transferPage;
  return (
    <p className="mt-6 text-ink-muted">
      {t.biggerVehicle}{" "}
      <a href={whatsappLink(site, t.biggerVehicleMessage)} className="font-medium text-ink underline underline-offset-4">
        {t.biggerVehicleLink}
      </a>
    </p>
  );
}

type PopularRoutesProps = SharedProps & { routes: PopularRoute[]; places: Place[]; vehicles: TransferVehicle[] };

// Each route shows every seat group at its cheapest car, so a guest needing a HiAce sees its price without searching.
function PopularRoutes({ routes, places, vehicles, site, locale, dict }: PopularRoutesProps) {
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
          const groups = seatOptions(quoteTransfer(vehicles, distanceKm), defaultParty, (quote) => quote.totalIdr, seatClasses.length);
          return (
            <li key={`${route.from}-${route.to}`}>
              <Link
                href={transferHref(localePath(locale, "/transfer"), route)}
                className="flex h-full flex-col justify-between gap-4 rounded-2xl bg-cream p-5 hover:bg-sand"
              >
                <span>
                  <span className="block font-medium">
                    {from.name} <span aria-hidden="true">→</span>
                    <span className="sr-only">–</span> {to.name}
                  </span>
                  <span className="mt-1 block text-[0.95rem] text-ink-muted">
                    {distanceKm} km · {formatDuration(minutes, dict.transfer.duration)}
                  </span>
                </span>
                <span className="block">
                  <span className="label block text-[0.75rem] text-ink-muted">{t.popularPrices}</span>
                  <span className="mt-1.5 block divide-y divide-ink/10 text-[0.95rem]">
                    {groups.map((group) => (
                      <span key={group.seatClass} className="flex items-baseline justify-between gap-3 py-1.5">
                        <span>{dict.transfer.seatClasses[group.seatClass]}</span>
                        <span className="font-medium whitespace-nowrap tabular-nums">{formatIdr(group.vehicle.totalIdr, locale)}</span>
                      </span>
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <BiggerVehicleNote site={site} dict={dict} />
    </section>
  );
}

function transferMessage({ search, party, from, to }: Trip, vehicle: string, priceIdr: number, locale: Locale, dict: Dictionary) {
  const t = dict.transferPage;
  const p = dict.pickers.party;
  return [
    t.messageIntro,
    fill(t.messageFrom, { place: from.name }),
    fill(t.messageTo, { place: to.name }),
    fill(t.messageDate, { date: search.date ? formatDate(search.date, locale) : t.messageUnknown }),
    fill(t.messageTime, { time: search.time ?? t.messageUnknown }),
    fill(p.messagePassengers, { party: describeParty(party, p, locale) }),
    party.luggage ? p.messageLuggage : p.messageNoLuggage,
    fill(t.messageVehicle, { vehicle }),
    fill(t.messagePrice, { price: formatIdr(priceIdr, locale) }),
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
