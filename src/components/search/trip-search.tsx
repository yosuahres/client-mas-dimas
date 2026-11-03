"use client";

import Form from "next/form";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode, type SVGProps } from "react";

import { Dropdown } from "@/components/dropdown";
import { ArrowRightIcon } from "@/components/icons";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill, formatDuration } from "@/i18n/format";
import { formatIdr } from "@/lib/money";
import type { Tour } from "@/lib/tours";
import {
  estimateRoute,
  findPlace,
  placeKinds,
  quoteTransfer,
  type Place,
  type TransferSearch,
  type TransferVehicle,
} from "@/lib/transfers";

export type SearchMode = "tours" | "transfer";

type TripSearchProps = {
  locale: Locale;
  text: Dictionary["search"];
  transferText: Dictionary["transfer"];
  tours: Pick<Tour, "slug" | "name" | "destinations">[];
  /** Transfer places with their names in this language, in the order set in the admin panel. */
  places: Place[];
  /** Cars offered for transfers, to price the route as it's picked. */
  vehicles: TransferVehicle[];
  defaultMode?: SearchMode;
  defaultTransfer?: Partial<TransferSearch>;
};

const modes: SearchMode[] = ["tours", "transfer"];

// One search box with two jobs: pick a tour package, or price a private car from A to B.
// Both are plain GET forms, so they still work before the JavaScript arrives.
export function TripSearch({
  locale,
  text,
  transferText,
  tours,
  places,
  vehicles,
  defaultMode = "tours",
  defaultTransfer,
}: TripSearchProps) {
  const [mode, setMode] = useState<SearchMode>(defaultMode);
  const baseId = useId();
  const tabRefs = useRef<Record<SearchMode, HTMLButtonElement | null>>({ tours: null, transfer: null });

  const selectByKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const next = modes[(modes.indexOf(mode) + 1) % modes.length];
    setMode(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      aria-label={text.label}
      className="rounded-3xl bg-white text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.35)]"
    >
      <div role="tablist" aria-label={text.label} className="flex gap-2 overflow-x-auto px-4 pt-4 sm:px-5 sm:pt-5">
        {modes.map((value) => (
          <button
            key={value}
            ref={(element) => {
              tabRefs.current[value] = element;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${value}`}
            aria-selected={mode === value}
            aria-controls={`${baseId}-panel-${value}`}
            tabIndex={mode === value ? 0 : -1}
            onClick={() => setMode(value)}
            onKeyDown={selectByKey}
            className="pill shrink-0 px-3.5 py-2.5 text-[0.85rem] text-ink-muted hover:text-ink aria-selected:bg-cream aria-selected:text-ink sm:px-4 sm:text-[0.95rem]"
          >
            {text.tabs[value]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-tours`}
        aria-labelledby={`${baseId}-tab-tours`}
        hidden={mode !== "tours"}
        className="p-4 sm:p-5"
      >
        <TourSearchForm locale={locale} text={text} tours={tours} />
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-transfer`}
        aria-labelledby={`${baseId}-tab-transfer`}
        hidden={mode !== "transfer"}
        className="p-4 sm:p-5"
      >
        <TransferSearchForm
          locale={locale}
          text={text}
          transferText={transferText}
          places={places}
          vehicles={vehicles}
          defaults={defaultTransfer}
        />
      </div>
    </section>
  );
}

function TourSearchForm({ locale, text, tours }: Pick<TripSearchProps, "locale" | "text" | "tours">) {
  const [slug, setSlug] = useState<string>(tours[0].slug);
  const [date, setDate] = useState("");

  const tour = tours.find((candidate) => candidate.slug === slug) ?? tours[0];

  return (
    <Form action={localePath(locale, `/tours/${tour.slug}`)}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_auto]">
        <Field label={text.tour} className="sm:col-span-2 lg:col-span-1">
          {({ labelId, controlId }) => (
            <Dropdown
              id={controlId}
              labelledBy={labelId}
              value={slug}
              onChange={setSlug}
              options={tours.map((option) => ({ value: option.slug, label: option.name }))}
            />
          )}
        </Field>
        <Field label={text.date}>
          {({ controlId }) => (
            <input
              id={controlId}
              type="date"
              name={date ? "date" : undefined}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={controlClass}
            />
          )}
        </Field>
        <SubmitButton>{text.searchTour}</SubmitButton>
      </div>

      <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[0.95rem]">
        <p aria-live="polite" className="tabular-nums">
          {tour.destinations.join(" · ")}
          <span className="block text-ink-muted">{text.tourHint}</span>
        </p>
        <Link href={localePath(locale, "/tours")} className="font-medium underline underline-offset-4">
          {text.browseAll}
        </Link>
      </div>
    </Form>
  );
}

type TransferFormProps = Pick<TripSearchProps, "locale" | "text" | "transferText" | "places" | "vehicles"> & {
  defaults?: Partial<TransferSearch>;
};

function TransferSearchForm({ locale, text, transferText, places, vehicles, defaults }: TransferFormProps) {
  const [from, setFrom] = useState<string>(defaults?.from ?? "yia");
  const [to, setTo] = useState<string>(defaults?.to ?? "");
  const [date, setDate] = useState(defaults?.date ?? "");
  const [time, setTime] = useState(defaults?.time ?? "");
  const [showProblem, setShowProblem] = useState(false);

  const fromPlace = findPlace(places, from);
  const toPlace = findPlace(places, to);
  const routeReady = fromPlace !== undefined && toPlace !== undefined && from !== to;
  const problem = !from || !to ? text.pickTwo : from === to ? text.samePlace : null;

  let estimate = text.pickTwo;
  if (routeReady) {
    const route = estimateRoute(fromPlace, toPlace);
    const [cheapest] = quoteTransfer(vehicles, route.distanceKm);
    estimate = fill(text.routeEstimate, {
      km: route.distanceKm,
      duration: formatDuration(route.minutes, transferText.duration),
      price: formatIdr(cheapest.totalIdr, locale),
    });
  } else if (from && from === to) {
    estimate = text.samePlace;
  }

  const blockIncomplete = (event: FormEvent<HTMLFormElement>) => {
    if (routeReady) return;
    event.preventDefault();
    setShowProblem(true);
  };

  const placeGroups = placeKinds
    .map((kind) => ({
      label: transferText.placeGroups[kind],
      options: places.filter((place) => place.kind === kind).map((place) => ({ value: place.id, label: place.name })),
    }))
    .filter((group) => group.options.length > 0);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <Form action={localePath(locale, "/transfer")} onSubmit={blockIncomplete}>
      <div className="grid gap-3 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)_auto]">
        <div className="relative grid gap-3 sm:grid-cols-2">
          <Field label={text.from}>
            {({ labelId, controlId }) => (
              <Dropdown
                id={controlId}
                labelledBy={labelId}
                name="from"
                value={from}
                onChange={setFrom}
                placeholder={text.choose}
                groups={placeGroups}
              />
            )}
          </Field>
          <button
            type="button"
            onClick={swap}
            aria-label={text.swap}
            title={text.swap}
            className="absolute top-1/2 right-4 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-ink/10 bg-white text-ink shadow-sm hover:border-ink/40 sm:right-auto sm:left-1/2 sm:-translate-x-1/2"
          >
            <SwapIcon className="size-4 rotate-90 sm:rotate-0" />
          </button>
          <Field label={text.to}>
            {({ labelId, controlId }) => (
              <Dropdown
                id={controlId}
                labelledBy={labelId}
                name="to"
                value={to}
                onChange={setTo}
                placeholder={text.choose}
                groups={placeGroups}
              />
            )}
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={text.date}>
            {({ controlId }) => (
              <input
                id={controlId}
                type="date"
                name={date ? "date" : undefined}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={controlClass}
              />
            )}
          </Field>
          <Field label={text.time}>
            {({ controlId }) => (
              <input
                id={controlId}
                type="time"
                step={900}
                name={time ? "time" : undefined}
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className={controlClass}
              />
            )}
          </Field>
        </div>

        <SubmitButton>{text.searchTransfer}</SubmitButton>
      </div>

      <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[0.95rem]">
        <p aria-live="polite" className={showProblem && problem ? "font-medium text-[#9b2c1c]" : "tabular-nums"}>
          {showProblem && problem ? problem : estimate}
        </p>
        <p className="text-ink-muted">{text.estimateNote}</p>
      </div>
    </Form>
  );
}

const controlClass =
  "w-full min-w-0 appearance-none bg-transparent font-medium text-ink outline-none [&::-webkit-calendar-picker-indicator]:opacity-60";

type FieldProps = {
  label: string;
  className?: string;
  /** Receives ids to wire the control to its label: aria-labelledby for dropdowns, id for inputs. */
  children: (ids: { labelId: string; controlId: string }) => ReactNode;
};

// A bordered box with a small typewriter label over the control. The box is the positioning
// context for dropdown lists, and the control stretches to make the whole box clickable.
function Field({ label, className = "", children }: FieldProps) {
  const labelId = useId();
  const controlId = useId();
  return (
    <div
      className={`relative flex min-h-[4.25rem] flex-col justify-center gap-0.5 rounded-2xl bg-cream px-4 py-2 hover:bg-sand focus-within:ring-2 focus-within:ring-jade/35 ${className}`}
    >
      <label id={labelId} htmlFor={controlId} className="label text-[0.78rem] text-ink-muted">
        {label}
      </label>
      {children({ labelId, controlId })}
    </div>
  );
}

function SubmitButton({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      className={`pill min-h-[4.25rem] rounded-2xl bg-jade px-7 text-white hover:bg-jade/90 active:scale-[0.98] ${className}`}
    >
      {children}
      <ArrowRightIcon className="size-4" />
    </button>
  );
}

function SwapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 5.5h10M10 3l2.5 2.5L10 8M13.5 10.5h-10M6 8l-2.5 2.5L6 13" />
    </svg>
  );
}
