import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, formatDuration } from "@/i18n/format";
import { formatIdr } from "@/lib/money";
import { tourHref, type Tour } from "@/lib/tours";
import {
  estimateRoute,
  findPlace,
  quoteTransfer,
  transferHref,
  type Place,
  type PopularRoute,
  type TransferVehicle,
} from "@/lib/transfers";

// What sits under the search form on the phone search screen, so it isn't empty: real packages and routes
// with their "from" prices, each one tap from its page.

type TourOffersProps = {
  locale: Locale;
  dict: Dictionary;
  tours: Pick<Tour, "slug" | "name" | "length" | "photo" | "priceFromIdr">[];
};

export function TourOffers({ locale, dict, tours }: TourOffersProps) {
  return (
    <section aria-labelledby="phone-tours-title">
      <OffersHeading id="phone-tours-title" title={dict.search.allPackages} href={localePath(locale, "/tours")} more={dict.toursSection.viewAll} />
      <ul className="mt-3 divide-y divide-ink/10 rounded-2xl bg-white px-4">
        {tours.map((tour) => (
          <li key={tour.slug}>
            <Link href={tourHref(locale, tour)} className="flex items-center gap-3.5 py-3">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                {tour.photo ? <Image src={tour.photo} alt="" fill sizes="4rem" className="object-cover" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block leading-snug font-medium">{tour.name}</span>
                <span className="mt-0.5 block text-[0.85rem] text-ink-muted">{dict.catalog.lengths[tour.length]}</span>
                <span className="mt-0.5 block text-[0.9rem] tabular-nums">
                  {tour.priceFromIdr === null
                    ? dict.tourPage.onRequest
                    : fill(dict.tourPage.fromPrice, { price: formatIdr(tour.priceFromIdr, locale) })}
                </span>
              </span>
              <Chevron />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

type RouteOffersProps = {
  locale: Locale;
  dict: Dictionary;
  routes: PopularRoute[];
  places: Place[];
  vehicles: TransferVehicle[];
};

export function RouteOffers({ locale, dict, routes, places, vehicles }: RouteOffersProps) {
  const transferPath = localePath(locale, "/transfer");
  return (
    <section aria-labelledby="phone-routes-title">
      <OffersHeading id="phone-routes-title" title={dict.transferPage.popularTitle} href={transferPath} more={dict.toursSection.viewAll} />
      <ul className="mt-3 divide-y divide-ink/10 rounded-2xl bg-white px-4">
        {routes.map((route) => {
          const from = findPlace(places, route.from);
          const to = findPlace(places, route.to);
          if (!from || !to || from.id === to.id) return null;
          const { distanceKm, minutes } = estimateRoute(from, to);
          const [cheapest] = quoteTransfer(vehicles, distanceKm);
          return (
            <li key={`${route.from}-${route.to}`}>
              <Link href={transferHref(transferPath, route)} className="flex items-center gap-3.5 py-3">
                <span className="min-w-0 flex-1">
                  {/* Full names, wrapping if long: guests need to see which airport or town */}
                  <span className="block leading-snug font-medium">
                    {from.name}
                    <ArrowRightIcon aria-hidden="true" className="mx-1.5 inline size-3.5 align-[-0.1em]" />
                    <span className="sr-only">–</span>
                    {to.name}
                  </span>
                  <span className="mt-0.5 block text-[0.85rem] text-ink-muted">
                    {distanceKm} km · {formatDuration(minutes, dict.transfer.duration)}
                  </span>
                  {cheapest ? (
                    <span className="mt-0.5 block text-[0.9rem] tabular-nums">
                      {fill(dict.tourPage.fromPrice, { price: formatIdr(cheapest.totalIdr, locale) })}
                    </span>
                  ) : null}
                </span>
                <Chevron />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function OffersHeading({ id, title, href, more }: { id: string; title: string; href: string; more: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h3 id={id} className="text-lg font-medium">
        {title}
      </h3>
      <Link href={href} className="text-[0.95rem] font-medium text-jade underline-offset-4 hover:underline">
        {more}
      </Link>
    </div>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0 text-ink-muted">
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
