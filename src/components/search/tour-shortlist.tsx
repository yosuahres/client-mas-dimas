import Link from "next/link";

import { MapIcon } from "@/components/icons";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill } from "@/i18n/format";
import { formatIdr } from "@/lib/money";
import { tourHref, type Tour } from "@/lib/tours";

const SHOWN = 3;

type TourShortlistProps = {
  locale: Locale;
  dict: Dictionary;
  tours: Pick<Tour, "slug" | "name" | "length" | "priceFromIdr">[];
};

// Phones, the home page's "Private transport tour" tab, like the Disney app: the first three packages as rows to
// tap straight into, then a link to all of them. Picking a date and party happens on the tour page.
export function TourShortlist({ locale, dict, tours }: TourShortlistProps) {
  return (
    <div>
      <ul className="grid grid-cols-1 gap-3">
        {tours.slice(0, SHOWN).map((tour) => (
          <li key={tour.slug}>
            <Link
              href={tourHref(locale, tour)}
              className="flex items-center gap-3 rounded-xl border border-ink/12 px-4 py-4 hover:bg-cream active:scale-[0.99]"
            >
              <MapIcon aria-hidden="true" className="size-5 shrink-0 self-start text-ink-muted" />
              <span className="min-w-0 flex-1">
                <span className="block text-[1.05rem] leading-snug font-medium">{tour.name}</span>
                <span className="mt-1 block text-[0.9rem] text-ink-muted">
                  {dict.catalog.lengths[tour.length]} ·{" "}
                  <span className="tabular-nums">
                    {tour.priceFromIdr === null
                      ? dict.tourPage.onRequest
                      : fill(dict.tourPage.fromPrice, { price: formatIdr(tour.priceFromIdr, locale) })}
                  </span>
                </span>
              </span>
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0 text-ink">
                <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={localePath(locale, "/tours")}
        className="mx-auto mt-5 flex w-fit items-center gap-2 py-1 font-medium text-jade underline-offset-4 hover:underline"
      >
        {dict.search.viewAllPackages}
      </Link>
    </div>
  );
}
