"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { intlLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import { Picker } from "./picker";

type PickersText = Dictionary["pickers"];

type DatePickerProps = {
  labelledBy: string;
  id?: string;
  /** When set, a picked date is also submitted with the surrounding form under this name. */
  name?: string;
  /** "YYYY-MM-DD", or "" for no date yet. */
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
  text: PickersText;
};

// How far ahead a trip can be booked
const MONTHS_AHEAD = 18;

export function DatePicker({ labelledBy, id, name, value, onChange, locale, text }: DatePickerProps) {
  return (
    <>
      <Picker
        id={id}
        labelledBy={labelledBy}
        display={value ? formatShort(value, locale) : text.date.placeholder}
        isEmpty={!value}
        title={text.date.title}
        closeLabel={text.close}
      >
        {(close) => (
          <Calendar
            value={value}
            onSelect={(date) => {
              onChange(date);
              close();
            }}
            onClear={
              value
                ? () => {
                    onChange("");
                    close();
                  }
                : undefined
            }
            locale={locale}
            text={text}
          />
        )}
      </Picker>
      {name && value ? <input type="hidden" name={name} value={value} /> : null}
    </>
  );
}

type CalendarProps = {
  value: string;
  onSelect: (date: string) => void;
  onClear?: () => void;
  locale: Locale;
  text: PickersText;
};

// A month grid starting on Monday. Days before today can't be picked.
// Arrow keys move a day or a week, Page Up and Page Down a month, Home and End to the ends of the week.
function Calendar({ value, onSelect, onClear, locale, text }: CalendarProps) {
  const [today] = useState(todayIso);
  const lastDay = lastDayOfMonth(addMonths(today, MONTHS_AHEAD));
  const [focused, setFocused] = useState(() => clampDate(value || today, today, lastDay));
  const [view, setView] = useState(() => monthOf(focused));
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${focused}"]`)?.focus();
  }, [focused]);

  const firstMonth = monthOf(today);
  const lastMonth = monthOf(lastDay);
  const canGoBack = view > firstMonth;
  const canGoForward = view < lastMonth;

  const showMonth = (month: string) => {
    setView(month);
    setFocused(clampDate(`${month}-${focused.slice(8)}`, today, lastDay, true));
  };

  const goTo = (date: string) => {
    const next = clampDate(date, today, lastDay);
    moveFocus.current = true;
    setFocused(next);
    setView(monthOf(next));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const weekday = mondayIndex(focused);
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekday),
      End: () => addDays(focused, 6 - weekday),
      PageUp: () => addMonths(focused, -1),
      PageDown: () => addMonths(focused, 1),
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    goTo(move());
  };

  const monthTitle = new Intl.DateTimeFormat(intlLocale[locale], { month: "long", year: "numeric", timeZone: "UTC" }).format(
    toDate(`${view}-01`),
  );
  const weekdayFormat = new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", timeZone: "UTC" });
  // 1 January 2024 was a Monday
  const weekdays = Array.from({ length: 7 }, (_, index) => weekdayFormat.format(toDate(addDays("2024-01-01", index))));
  const dayLabel = new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const firstOfMonth = `${view}-01`;
  const leadingBlanks = mondayIndex(firstOfMonth);
  const days = Array.from({ length: Number(lastDayOfMonth(firstOfMonth).slice(8)) }, (_, index) => addDays(firstOfMonth, index));
  const cells: (string | null)[] = [...Array<null>(leadingBlanks).fill(null), ...days];

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <MonthButton label={text.date.previousMonth} disabled={!canGoBack} onClick={() => showMonth(addMonths(firstOfMonth, -1).slice(0, 7))}>
          <path d="M10 3.5 5.5 8l4.5 4.5" />
        </MonthButton>
        <p aria-live="polite" className="font-medium first-letter:uppercase">
          {monthTitle}
        </p>
        <MonthButton label={text.date.nextMonth} disabled={!canGoForward} onClick={() => showMonth(addMonths(firstOfMonth, 1).slice(0, 7))}>
          <path d="M6 3.5 10.5 8 6 12.5" />
        </MonthButton>
      </div>

      <div ref={gridRef} onKeyDown={handleKeyDown} className="mt-3">
        <div aria-hidden="true" className="grid grid-cols-7 text-center text-[0.75rem] text-ink-muted">
          {weekdays.map((weekday) => (
            <span key={weekday} className="label py-1 text-[0.75rem] first-letter:uppercase">
              {weekday.replace(".", "")}
            </span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1">
          {cells.map((date, index) => {
            if (!date) return <span key={`blank-${index}`} />;
            const disabled = date < today || date > lastDay;
            const selected = date === value;
            const isToday = date === today;
            return (
              <button
                key={date}
                type="button"
                data-date={date}
                data-autofocus={date === focused ? true : undefined}
                tabIndex={date === focused ? 0 : -1}
                disabled={disabled}
                aria-pressed={selected}
                aria-current={isToday ? "date" : undefined}
                aria-label={dayLabel.format(toDate(date))}
                onClick={() => onSelect(date)}
                className={`relative mx-auto grid size-10 place-items-center rounded-full text-[0.95rem] tabular-nums sm:size-9 ${
                  selected
                    ? "bg-jade font-medium text-white"
                    : disabled
                      ? "cursor-not-allowed text-ink/25"
                      : "hover:bg-cream"
                }`}
              >
                {Number(date.slice(8))}
                {isToday && !selected ? (
                  <span aria-hidden="true" className="absolute bottom-1 size-1 rounded-full bg-gold" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {onClear ? (
        <div className="mt-3 flex justify-start border-t border-ink/10 pt-2">
          <button type="button" onClick={onClear} className="rounded-full px-3 py-2 font-medium underline underline-offset-4 hover:bg-cream">
            {text.clear}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MonthButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-10 place-items-center rounded-full hover:bg-cream disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent sm:size-9"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}

// Dates are "YYYY-MM-DD" strings, worked on as UTC midnight so no time zone can shift the day.

function toDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`);
}

function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Today in the guest's own time zone. */
function todayIso() {
  const now = new Date();
  return toIso(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

function addDays(isoDate: string, days: number) {
  const date = toDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

/** The same day of another month, or that month's last day when it is shorter. */
function addMonths(isoDate: string, months: number) {
  const date = toDate(isoDate);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const daysInMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
  date.setUTCDate(Math.min(day, daysInMonth));
  return toIso(date);
}

function lastDayOfMonth(isoDate: string) {
  const date = toDate(isoDate);
  return toIso(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)));
}

/** "YYYY-MM" */
function monthOf(isoDate: string) {
  return isoDate.slice(0, 7);
}

/** 0 for Monday through 6 for Sunday. */
function mondayIndex(isoDate: string) {
  return (toDate(isoDate).getUTCDay() + 6) % 7;
}

/** Keep a date between two others; with fixDay, first repair a day past the end of its month ("2026-02-31"). */
function clampDate(isoDate: string, min: string, max: string, fixDay = false) {
  let date = isoDate;
  if (fixDay) {
    const last = lastDayOfMonth(`${date.slice(0, 7)}-01`);
    if (date > last) date = last;
  }
  if (date < min) return min;
  if (date > max) return max;
  return date;
}

/** "Tue 3 Dec", with the year only when it isn't this year. Narrow fields drop the weekday. */
function formatShort(isoDate: string, locale: Locale) {
  const sameYear = isoDate.slice(0, 4) === String(new Date().getFullYear());
  const date = toDate(isoDate);
  const weekday = new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", timeZone: "UTC" }).format(date);
  const dayMonth = new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  }).format(date);
  return (
    <>
      <span className="@max-[5.25rem]:sr-only">{weekday} </span>
      {dayMonth}
    </>
  );
}
