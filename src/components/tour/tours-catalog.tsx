"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState, type ReactNode } from "react";

import { Dropdown } from "@/components/dropdown";
import { TourRow } from "@/components/tour/tour-row";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill } from "@/i18n/format";
import {
  isTourStay,
  priceSortKey,
  tourInterests,
  tourLengths,
  tourStays,
  type Tour,
  type TourInterest,
  type TourLength,
  type TourStay,
} from "@/lib/tours";

type SortOrder = "popular" | "price";

type ToursCatalogProps = {
  tours: Tour[];
  locale: Locale;
  text: Dictionary["catalog"];
  rowText: Dictionary["tourRow"];
  /** WhatsApp link asking for a custom tour, offered when no package matches the filters. */
  customLink: string;
  initialInterest?: TourInterest | null;
  initialStay?: TourStay;
};

function isTourInterest(value: string | null): value is TourInterest {
  return value !== null && (tourInterests as readonly string[]).includes(value);
}

/** The catalog, starting from the interest picked on the landing page (?interest=temples) and the package type (?stay=accommodation). Render inside Suspense. */
export function ToursCatalogFromSearch(props: Omit<ToursCatalogProps, "initialInterest" | "initialStay">) {
  const params = useSearchParams();
  const interest = params.get("interest");
  const stay = params.get("stay");
  return (
    <ToursCatalog
      {...props}
      initialInterest={isTourInterest(interest) ? interest : null}
      initialStay={isTourStay(stay) ? stay : "transport"}
    />
  );
}

function StayOption({ selected, onSelect, title, hint }: { selected: boolean; onSelect: () => void; title: string; hint: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left sm:p-5 ${
        selected ? "border-ink bg-white shadow-[0_12px_30px_-20px_rgb(0_0_0/0.35)]" : "border-ink/15 hover:border-ink/40"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-1 grid size-4 shrink-0 place-items-center rounded-full border ${selected ? "border-ink" : "border-ink/30"}`}
      >
        {selected ? <span className="size-2 rounded-full bg-ink" /> : null}
      </span>
      <span>
        <span className="block text-lg font-medium tracking-[-0.02em]">{title}</span>
        <span className="mt-1 block text-[0.95rem] text-ink-muted">{hint}</span>
      </span>
    </button>
  );
}

function FilterButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-[0.95rem] font-medium ${
        pressed ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-ink/40"
      }`}
    >
      {children}
    </button>
  );
}

export function ToursCatalog({
  tours,
  locale,
  text,
  rowText,
  customLink,
  initialInterest = null,
  initialStay = "transport",
}: ToursCatalogProps) {
  const [stay, setStay] = useState<TourStay>(initialStay);
  const [length, setLength] = useState<TourLength | null>(null);
  const [interest, setInterest] = useState<TourInterest | null>(initialInterest);
  const [sort, setSort] = useState<SortOrder>("popular");
  const sortLabelId = useId();

  const available = stay === "accommodation" ? tours.filter((tour) => tour.accommodationOffered) : tours;
  const matching = available.filter(
    (tour) => (length === null || tour.length === length) && (interest === null || tour.interests.includes(interest)),
  );
  // The source list is already in order of popularity.
  const shown =
    sort === "price"
      ? matching.toSorted((a, b) => priceSortKey(a, stay) - priceSortKey(b, stay))
      : matching;

  const clearFilters = () => {
    setLength(null);
    setInterest(null);
  };

  return (
    <div>
      <div role="radiogroup" aria-label={text.stayLabel} className="mb-8 grid gap-3 sm:grid-cols-2">
        {tourStays.map((value) => (
          <StayOption
            key={value}
            selected={stay === value}
            onSelect={() => setStay(value)}
            title={text.stays[value]}
            hint={text.stayHints[value]}
          />
        ))}
      </div>

      <div className="grid gap-6 border-b border-sand pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-5">
          <fieldset>
            <legend className="text-[0.95rem] text-ink-muted">{text.howLong}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterButton pressed={length === null} onClick={() => setLength(null)}>
                {text.anyLength}
              </FilterButton>
              {tourLengths.map((value) => (
                <FilterButton key={value} pressed={length === value} onClick={() => setLength(value)}>
                  {text.lengths[value]}
                </FilterButton>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-[0.95rem] text-ink-muted">{text.interestsLegend}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterButton pressed={interest === null} onClick={() => setInterest(null)}>
                {text.everything}
              </FilterButton>
              {tourInterests.map((value) => (
                <FilterButton key={value} pressed={interest === value} onClick={() => setInterest(value)}>
                  {text.interests[value]}
                </FilterButton>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex items-center gap-3 text-[0.95rem]">
          <span id={sortLabelId} className="text-ink-muted">
            {text.sortBy}
          </span>
          <div className="relative w-48 rounded-full bg-cream px-4 py-2.5 hover:bg-sand focus-within:ring-2 focus-within:ring-jade/35">
            <Dropdown
              labelledBy={sortLabelId}
              value={sort}
              onChange={(value) => setSort(value === "price" ? "price" : "popular")}
              options={[
                { value: "popular", label: text.mostBooked },
                { value: "price", label: text.lowestPrice },
              ]}
            />
          </div>
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-ink-muted">
        {shown.length === available.length
          ? fill(text.countAll, { total: available.length })
          : fill(text.countSome, { shown: shown.length, total: available.length })}
      </p>

      {shown.length > 0 ? (
        <ul className="mt-2 divide-y divide-sand border-b border-sand">
          {shown.map((tour) => (
            <li key={tour.slug}>
              <TourRow tour={tour} locale={locale} text={rowText} stay={stay} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-3xl bg-cream px-6 py-10">
          <p className="text-lg font-medium">{text.emptyTitle}</p>
          <p className="mt-2 max-w-prose text-ink-muted">{text.emptyBody}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={clearFilters} className="rounded-full bg-ink px-5 py-3 font-medium text-white">
              {text.showAll}
            </button>
            <a
              href={customLink}
              className="rounded-full border border-ink/30 px-5 py-3 font-medium hover:border-ink"
            >
              {text.askCustom}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
