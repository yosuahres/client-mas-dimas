"use client";

import Form from "next/form";
import { createContext, useContext, useId, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent, type ReactNode, type SVGProps } from "react";

import { Dropdown } from "@/components/dropdown";
import {
  CalendarIcon,
  CarIcon,
  ClockIcon,
  DepartIcon,
  MapIcon,
  PersonIcon,
  PinIcon,
} from "@/components/icons";
import { DatePicker } from "@/components/pickers/date-picker";
import { PartyPicker } from "@/components/pickers/party-picker";
import { TimePicker } from "@/components/pickers/time-picker";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { defaultParty, type Party } from "@/lib/party";
import type { Tour } from "@/lib/tours";
import { saveRecentSearch } from "@/lib/recent-searches";
import { findPlace, placeKinds, type Place, type TransferSearch } from "@/lib/transfers";

import { RecentSearches } from "./recent-searches";

// Home page on phones: the open form sits straight on the white, Disney-style: label over value, thin lines
// between rows, no boxes. Tablets and desktop keep the boxed fields.
const FlatOnPhones = createContext(false);

function usePhoneOnly(classes: string) {
  return useContext(FlatOnPhones) ? classes : "";
}

export type SearchMode = "tours" | "transfer";

type TripSearchProps = {
  locale: Locale;
  text: Dictionary["search"];
  transferText: Dictionary["transfer"];
  pickerText: Dictionary["pickers"];
  tours: Pick<Tour, "slug" | "name">[];
  /** Transfer places with their names in this language, in the order set in the admin panel. */
  places: Place[];
  defaultMode?: SearchMode;
  defaultTransfer?: Partial<TransferSearch>;
  /** Passengers and luggage from the URL; both tabs share them. */
  defaultParty?: Party;
  /** Phones: this tab's recent searches under the form, one tap to run them again. */
  showRecent?: boolean;
  /** Phones: a card with two icon tabs over the open form; tapping the open tab folds it, tapping a tab opens it again. */
  collapsible?: boolean;
  /** Phones: shown in the "Private transport tour" tab in place of the tour form, e.g. a short list of packages. */
  phoneTours?: ReactNode;
};

const modes: SearchMode[] = ["tours", "transfer"];

// One search box with two jobs: pick a tour package, or a private car from A to B.
// Both are plain GET forms, so they still work before the JavaScript arrives.
export function TripSearch({
  locale,
  text,
  transferText,
  pickerText,
  tours,
  places,
  defaultMode = "tours",
  defaultTransfer,
  defaultParty: initialParty = defaultParty,
  showRecent = false,
  collapsible = false,
  phoneTours,
}: TripSearchProps) {
  const [mode, setMode] = useState<SearchMode>(defaultMode);
  const [party, setParty] = useState<Party>(initialParty);
  const shared = { locale, text, pickerText, party, onPartyChange: setParty };
  const baseId = useId();
  const tabRefs = useRef<Record<SearchMode, HTMLButtonElement | null>>({ tours: null, transfer: null });

  // Phones only, and only where asked (the home page): the form starts open and folds away when its tab is tapped again
  const [open, setOpen] = useState(true);
  const phone = useSyncExternalStore(subscribeToPhone, isPhone, () => false);
  const folded = collapsible && !open;

  const choose = (value: SearchMode) => {
    if (collapsible && phone && open && value === mode) {
      setOpen(false);
      return;
    }
    setMode(value);
    setOpen(true);
  };

  const selectByKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const next = modes[(modes.indexOf(mode) + 1) % modes.length];
    setMode(next);
    setOpen(true);
    tabRefs.current[next]?.focus();
  };

  const forms: Record<SearchMode, ReactNode> = {
    tours: <TourSearchForm {...shared} tours={tours} />,
    transfer: (
      <TransferSearchForm {...shared} transferText={transferText} places={places} defaults={defaultTransfer} />
    ),
  };

  // Phones: the home page gets two icon tabs split by a thin line; other pages a flat two-way switch.
  // Wider screens: pills over the form.
  const tablistClass = collapsible
    ? "relative grid grid-cols-2 border-b border-ink/10 before:absolute before:inset-y-5 before:left-1/2 before:w-px before:bg-ink/15 sm:flex sm:gap-2 sm:border-0 sm:px-5 sm:pt-5 sm:before:hidden"
    : "mx-4 mt-4 flex gap-1 rounded-full bg-cream p-1 sm:mx-0 sm:mt-0 sm:gap-2 sm:overflow-x-auto sm:rounded-none sm:bg-transparent sm:px-5 sm:pt-5 sm:pb-0";
  const tabClass = collapsible
    ? "pill text-ink-muted hover:text-ink aria-selected:bg-cream aria-selected:text-ink max-sm:min-w-0 max-sm:flex-col max-sm:gap-1.5 max-sm:text-center max-sm:leading-tight max-sm:whitespace-normal max-sm:rounded-none max-sm:bg-transparent max-sm:px-2 max-sm:pt-3 max-sm:pb-3 max-sm:text-[0.95rem] max-sm:text-ink max-sm:aria-selected:bg-transparent max-sm:data-[open=true]:text-jade sm:shrink-0 sm:px-4 sm:py-2.5 sm:text-[0.95rem]"
    : "pill min-w-0 flex-1 justify-center px-2 py-2.5 text-[0.85rem] text-ink-muted max-sm:text-center max-sm:leading-tight max-sm:whitespace-normal hover:text-ink aria-selected:bg-white aria-selected:text-ink sm:flex-none sm:shrink-0 sm:px-4 sm:text-[0.95rem] sm:aria-selected:bg-cream";
  const panelClass = `p-4 sm:p-5 ${folded ? "max-sm:hidden" : ""}`;

  return (
    <section
      aria-label={text.label}
      className={`relative bg-white text-ink sm:rounded-3xl sm:shadow-[0_20px_50px_-20px_rgb(0_0_0/0.35)] ${collapsible ? "max-sm:rounded-2xl max-sm:shadow-[0_16px_40px_-16px_rgb(0_0_0/0.35)]" : ""}`}
    >
      <div role="tablist" aria-label={text.label} className={tablistClass}>
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
            aria-expanded={collapsible && phone ? open && mode === value : undefined}
            data-open={collapsible && open && mode === value}
            tabIndex={mode === value ? 0 : -1}
            onClick={() => choose(value)}
            onKeyDown={selectByKey}
            className={tabClass}
          >
            {collapsible ? (
              <span aria-hidden="true" className="sm:hidden">
                {tabIcons[value]}
              </span>
            ) : null}
            {text.tabs[value]}
          </button>
        ))}
      </div>

      <FlatOnPhones value={collapsible}>
        <div role="tabpanel" id={`${baseId}-panel-tours`} aria-labelledby={`${baseId}-tab-tours`} hidden={mode !== "tours"} className={panelClass}>
          {phoneTours ? (
            <>
              <div className="sm:hidden">{phoneTours}</div>
              <div className="max-sm:hidden">{forms.tours}</div>
            </>
          ) : (
            forms.tours
          )}
        </div>
        <div
          role="tabpanel"
          id={`${baseId}-panel-transfer`}
          aria-labelledby={`${baseId}-tab-transfer`}
          hidden={mode !== "transfer"}
          className={panelClass}
        >
          {forms.transfer}
        </div>
      </FlatOnPhones>
      {showRecent && !folded && !(mode === "tours" && phoneTours) ? (
        <div className="px-4 pb-4 sm:hidden">
          <RecentSearches mode={mode} locale={locale} text={text} places={places} tours={tours} />
        </div>
      ) : null}

      {/* Folded: a small notch with a caret under the tabs, hinting there is more to open */}
      {folded ? (
        <span
          aria-hidden="true"
          className="absolute top-full left-1/2 grid h-3.5 w-12 -translate-x-1/2 place-items-center rounded-b-lg bg-white text-ink-muted sm:hidden"
        >
          <svg viewBox="0 0 12 8" className="h-1.5 w-2.5">
            <path d="M1 1.5 6 6.5l5-5" fill="currentColor" />
          </svg>
        </span>
      ) : null}
    </section>
  );
}

const tabIcons: Record<SearchMode, ReactNode> = {
  tours: <MapIcon className="size-6" />,
  transfer: <CarIcon className="size-6" />,
};

const PHONE = "(max-width: 39.99rem)";

function subscribeToPhone(onChange: () => void) {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function isPhone() {
  return window.matchMedia(PHONE).matches;
}

type SharedFormProps = Pick<TripSearchProps, "locale" | "text" | "pickerText"> & {
  party: Party;
  onPartyChange: (party: Party) => void;
};

function TourSearchForm({ locale, text, pickerText, party, onPartyChange, tours }: SharedFormProps & Pick<TripSearchProps, "tours">) {
  const [slug, setSlug] = useState<string>(tours[0].slug);
  const [date, setDate] = useState("");

  const tour = tours.find((candidate) => candidate.slug === slug) ?? tours[0];
  const rows = usePhoneOnly("max-sm:gap-0");
  const buttonGap = usePhoneOnly("max-sm:mt-5");

  return (
    <Form
      action={localePath(locale, `/tours/${tour.slug}`)}
      onSubmit={() => saveRecentSearch({ mode: "tours", slug: tour.slug, date: date || undefined, party })}
    >
      {/* Like tiket.com: stacked rows with icons on phones, one line with labels from 1024px */}
      <div className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:gap-3 ${rows}`}>
        <Field label={text.tour} icon={<MapIcon className={iconClass} />} className="sm:col-span-2 lg:col-span-1">
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
        <Field label={text.date} icon={<CalendarIcon className={iconClass} />}>
          {({ labelId, controlId }) => (
            <DatePicker id={controlId} labelledBy={labelId} name="date" value={date} onChange={setDate} locale={locale} text={pickerText} />
          )}
        </Field>
        <Field label={pickerText.party.title} icon={<PersonIcon className={iconClass} />}>
          {({ labelId, controlId }) => (
            <PartyPicker id={controlId} labelledBy={labelId} submit value={party} onChange={onPartyChange} locale={locale} text={pickerText} />
          )}
        </Field>
        <SubmitButton className={`sm:col-span-2 lg:col-span-1 ${buttonGap}`}>{text.searchTour}</SubmitButton>
      </div>
    </Form>
  );
}

type TransferFormProps = SharedFormProps & Pick<TripSearchProps, "transferText" | "places"> & {
  defaults?: Partial<TransferSearch>;
};

function TransferSearchForm({
  locale,
  text,
  pickerText,
  party,
  onPartyChange,
  transferText,
  places,
  defaults,
}: TransferFormProps) {
  const [from, setFrom] = useState<string>(defaults?.from ?? "yia");
  const [to, setTo] = useState<string>(defaults?.to ?? "");
  const [date, setDate] = useState(defaults?.date ?? "");
  const [time, setTime] = useState(defaults?.time ?? "");
  const [showProblem, setShowProblem] = useState(false);
  const rows = usePhoneOnly("max-sm:gap-0");
  const buttonGap = usePhoneOnly("max-sm:mt-5");
  const unboxed = usePhoneOnly("max-sm:rounded-none max-sm:bg-transparent");
  const lineless = usePhoneOnly("max-sm:hidden");
  const swapEdge = usePhoneOnly("max-sm:right-0");
  const timeInset = usePhoneOnly("max-sm:pl-4");
  const clearOfSwap = usePhoneOnly("max-sm:pr-14");

  const routeReady = findPlace(places, from) !== undefined && findPlace(places, to) !== undefined && from !== to;
  const problem = !from || !to ? text.pickTwo : from === to ? text.samePlace : null;
  const flagRoute = showProblem && problem !== null;

  const blockIncomplete = (event: FormEvent<HTMLFormElement>) => {
    if (routeReady) {
      saveRecentSearch({ mode: "transfer", from, to, date: date || undefined, time: time || undefined, party });
      return;
    }
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
      {/*
        Like tiket.com. Phones: From and To share one box with the swap button on its edge, then date and time
        in one box, passengers, and the button. From 1024px: one line, with the swap button between From and To.
      */}
      <div className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1.3fr)_minmax(0,1.15fr)_auto] lg:gap-3 ${rows}`}>
        <div
          className={`relative grid grid-cols-1 rounded-xl bg-cream sm:col-span-2 lg:col-span-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-2 lg:rounded-2xl lg:bg-transparent ${unboxed} ${
            flagRoute ? "ring-2 ring-[#9b2c1c]/70 ring-offset-2" : ""
          }`}
        >
          <Field label={text.from} icon={<DepartIcon className={iconClass} />} grouped className={`max-lg:pr-16 ${clearOfSwap}`}>
            {({ labelId, controlId }) => (
              <Dropdown
                id={controlId}
                labelledBy={labelId}
                name="from"
                value={from}
                onChange={setFrom}
                placeholder={text.choose}
                groups={placeGroups}
                chevron={false}
              />
            )}
          </Field>
          <div aria-hidden="true" className={`ml-12 mr-16 h-px bg-ink/10 lg:hidden ${lineless}`} />
          <button
            type="button"
            onClick={swap}
            aria-label={text.swap}
            title={text.swap}
            className={`absolute top-1/2 right-3 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-xl border border-ink/10 bg-white text-ink hover:bg-sand lg:static lg:size-11 lg:translate-y-0 ${swapEdge}`}
          >
            <SwapIcon className="size-4 rotate-90 lg:rotate-0" />
          </button>
          <Field label={text.to} icon={<PinIcon className={iconClass} />} grouped className={`max-lg:pr-16 ${clearOfSwap}`}>
            {({ labelId, controlId }) => (
              <Dropdown
                id={controlId}
                labelledBy={labelId}
                name="to"
                value={to}
                onChange={setTo}
                placeholder={text.choose}
                groups={placeGroups}
                chevron={false}
              />
            )}
          </Field>
        </div>

        <div className={`grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] rounded-xl bg-cream lg:grid-cols-2 lg:gap-3 lg:rounded-none lg:bg-transparent ${unboxed}`}>
          <Field label={text.date} icon={<CalendarIcon className={iconClass} />} grouped>
            {({ labelId, controlId }) => (
              <DatePicker id={controlId} labelledBy={labelId} name="date" value={date} onChange={setDate} locale={locale} text={pickerText} />
            )}
          </Field>
          <Field
            label={text.time}
            icon={<ClockIcon className={iconClass} />}
            grouped
            className={`max-lg:before:absolute max-lg:before:inset-y-3 max-lg:before:left-0 max-lg:before:w-px max-lg:before:bg-ink/10 ${timeInset}`}
          >
            {({ labelId, controlId }) => (
              <TimePicker id={controlId} labelledBy={labelId} name="time" value={time} onChange={setTime} text={pickerText} />
            )}
          </Field>
        </div>

        <Field label={pickerText.party.title} icon={<PersonIcon className={iconClass} />}>
          {({ labelId, controlId }) => (
            <PartyPicker id={controlId} labelledBy={labelId} submit value={party} onChange={onPartyChange} locale={locale} text={pickerText} />
          )}
        </Field>

        <SubmitButton className={`sm:col-span-2 lg:col-span-1 ${buttonGap}`}>{text.searchTransfer}</SubmitButton>
      </div>
      {/* No words under the form: the red outline shows what's missing, and screen readers hear why */}
      <p aria-live="polite" className="sr-only">
        {flagRoute ? problem : ""}
      </p>
    </Form>
  );
}

const iconClass = "size-[1.15rem]";

type FieldProps = {
  label: string;
  /** Shown on the left on phones and tablets, where the label is visually hidden. */
  icon: ReactNode;
  /** Sits inside a shared box on phones (From and To, date and time), so it has no fill of its own there. */
  grouped?: boolean;
  className?: string;
  /** Receives ids to wire the control to its label: aria-labelledby for the control, id so the label's click reaches it. */
  children: (ids: { labelId: string; controlId: string }) => ReactNode;
};

// Phones and tablets: a compact row with an icon and the value, the label kept for screen readers only.
// From 1024px: a taller box with the small label over the value. The box is the positioning context for
// dropdown lists and picker panels, and the control stretches to make the whole box clickable.
function Field({ label, icon, grouped = false, className = "", children }: FieldProps) {
  const labelId = useId();
  const controlId = useId();
  const row = usePhoneOnly(
    "max-sm:rounded-none max-sm:border-b max-sm:border-ink/10 max-sm:bg-transparent max-sm:px-0 max-sm:py-3 max-sm:hover:bg-transparent",
  );
  const labelHidden = useContext(FlatOnPhones) ? "sm:max-lg:sr-only" : "max-lg:sr-only";
  return (
    <div
      className={`relative flex min-h-12 min-w-0 items-center gap-3 rounded-xl px-3.5 py-2 hover:bg-sand focus-within:ring-2 focus-within:ring-jade/35 lg:min-h-[4.25rem] lg:rounded-2xl lg:px-4 ${
        grouped ? "lg:bg-cream" : "bg-cream"
      } ${row} ${className}`}
    >
      <span aria-hidden="true" className="shrink-0 text-ink-muted lg:hidden">
        {icon}
      </span>
      {/* @container: the date drops its weekday when this gets narrow */}
      <div className="@container flex min-w-0 flex-1 flex-col gap-0.5">
        <label id={labelId} htmlFor={controlId} className={`label truncate text-[0.78rem] text-ink-muted ${labelHidden}`}>
          {label}
        </label>
        {children({ labelId, controlId })}
      </div>
    </div>
  );
}

function SubmitButton({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      className={`pill min-h-12 rounded-xl bg-jade px-7 text-white hover:bg-jade/90 lg:min-h-[4.25rem] lg:rounded-2xl lg:max-xl:px-5 active:scale-[0.98] ${className}`}
    >
      {children}
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
