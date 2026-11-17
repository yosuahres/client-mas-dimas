"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { ArrowRightIcon, PersonIcon } from "@/components/icons";
import { intlLocale, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { partyParams, partySize } from "@/lib/party";
import {
  clearRecentSearches,
  getRecentSearches,
  getServerRecentSearches,
  subscribeToRecentSearches,
  type RecentSearch,
} from "@/lib/recent-searches";
import { transferHref, type Place } from "@/lib/transfers";

import type { SearchMode } from "./trip-search";

type RecentSearchesProps = {
  mode: SearchMode;
  locale: Locale;
  text: Dictionary["search"];
  places: Pick<Place, "id" | "name">[];
  tours: { slug: string; name: string }[];
};

type Card = { key: string; href: string; from: string; to?: string; when: string; people: number };

// "Recently searched" under the phone search form, like airline apps: tap a card to run that search again.
// Only this tab's searches; hidden until this browser has saved one, and never rendered on the server.
export function RecentSearches({ mode, locale, text, places, tours }: RecentSearchesProps) {
  const searches = useSyncExternalStore(subscribeToRecentSearches, getRecentSearches, getServerRecentSearches);
  const cards = searches
    .filter((search) => search.mode === mode)
    .map((search) => toCard(search, { locale, text, places, tours }))
    .filter((card) => card !== null);
  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="recent-title" className="mt-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 id="recent-title" className="font-medium">
          {text.recentTitle}
        </h3>
        <button type="button" onClick={() => clearRecentSearches(mode)} className="font-medium text-jade">
          {text.clearRecent}
        </button>
      </div>
      <ul className="-mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((card) => (
          <li key={card.key} className="w-[16.5rem] shrink-0 snap-start">
            <Link href={card.href} className="flex items-center gap-3 rounded-2xl border border-ink/12 bg-white p-4 hover:bg-cream">
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-medium">
                  <span className="truncate">{card.from}</span>
                  {card.to ? (
                    <>
                      <ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0" />
                      <span className="sr-only">–</span>
                      <span className="truncate">{card.to}</span>
                    </>
                  ) : null}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-[0.9rem] text-ink-muted tabular-nums">
                  {card.when}
                  <span aria-hidden="true">·</span>
                  <PersonIcon aria-hidden="true" className="size-3.5" />
                  {card.people}
                </span>
              </span>
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0 text-ink-muted">
                <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function toCard(search: RecentSearch, { locale, text, places, tours }: Omit<RecentSearchesProps, "mode">): Card | null {
  const when = [search.date ? formatDay(search.date, locale) : text.anyDate, search.mode === "transfer" ? search.time : null]
    .filter(Boolean)
    .join(", ");
  const people = partySize(search.party);
  const party = new URLSearchParams(partyParams(search.party)).toString();

  if (search.mode === "tours") {
    // Packages can be unpublished after the search was saved
    const tour = tours.find((candidate) => candidate.slug === search.slug);
    if (!tour) return null;
    const date = search.date ? `date=${search.date}&` : "";
    const href = `${localePath(locale, `/tours/${tour.slug}`)}?${date}${party}`;
    return { key: `tours-${search.slug}-${search.date ?? ""}`, href, from: tour.name, when, people };
  }

  const from = places.find((place) => place.id === search.from);
  const to = places.find((place) => place.id === search.to);
  if (!from || !to) return null;
  const href = `${transferHref(localePath(locale, "/transfer"), search)}&${party}`;
  return { key: `transfer-${search.from}-${search.to}-${search.date ?? ""}`, href, from: from.name, to: to.name, when, people };
}

/** "22 Dec" from "2026-12-22", without the time zone shifting the day. */
function formatDay(isoDate: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}
