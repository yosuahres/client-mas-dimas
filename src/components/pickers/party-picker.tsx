"use client";

import type { ReactNode } from "react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill } from "@/i18n/format";
import { clampGroup, partyGroups, partyLimits, partyParams, partySize, plural, type Party, type PartyGroup } from "@/lib/party";

import { Picker, PickerFooter } from "./picker";

type PartyPickerProps = {
  labelledBy: string;
  id?: string;
  /** Also submit the party with the surrounding form (adults, kids, infants, luggage). */
  submit?: boolean;
  value: Party;
  onChange: (value: Party) => void;
  locale: Locale;
  text: Dictionary["pickers"];
};

// Passengers by age group with steppers, like airline search, and a switch for luggage.
export function PartyPicker({ labelledBy, id, submit, value, onChange, locale, text }: PartyPickerProps) {
  const t = text.party;
  // "3 people, with luggage", like "1 Passenger, Economy" on airline search
  const summary = plural(partySize(value), t.total, locale) + (value.luggage ? `, ${t.withLuggage}` : "");

  const step = (group: PartyGroup, by: number) => onChange({ ...value, [group]: clampGroup(group, value[group] + by) });

  return (
    <>
      <Picker
        id={id}
        labelledBy={labelledBy}
        display={summary}
        isEmpty={false}
        title={t.title}
        closeLabel={text.close}
        panelClassName="w-[24rem]"
        align="end"
      >
        {(close) => (
          <div>
            {/* The three age groups side by side in one row, like airline search */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {partyGroups.map((group, index) => {
                const { label, hint } = t.groups[group];
                const count = value[group];
                return (
                  <div key={group} className="min-w-0">
                    <p className="truncate font-medium">{label}</p>
                    <p className="truncate text-[0.85rem] text-ink-muted">{hint}</p>
                    <div className="mt-2.5 flex items-center justify-between gap-1">
                      <StepButton
                        label={fill(t.fewer, { group: label })}
                        disabled={count <= partyLimits[group].min}
                        onClick={() => step(group, -1)}
                      >
                        <path d="M3.5 8h9" />
                      </StepButton>
                      <span aria-live="polite" className="min-w-5 text-center text-lg font-medium tabular-nums">
                        {count}
                      </span>
                      <StepButton
                        label={fill(t.more, { group: label })}
                        disabled={count >= partyLimits[group].max}
                        autoFocus={index === 0}
                        onClick={() => step(group, 1)}
                      >
                        <path d="M3.5 8h9M8 3.5v9" />
                      </StepButton>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 border-t border-ink/10 pt-4">
              <div>
                <p id={`${labelledBy}-luggage`} className="font-medium">
                  {t.luggage}
                </p>
                <p className="text-[0.9rem] text-ink-muted">{t.luggageHint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={value.luggage}
                aria-labelledby={`${labelledBy}-luggage`}
                onClick={() => onChange({ ...value, luggage: !value.luggage })}
                className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${value.luggage ? "bg-jade" : "bg-ink/15"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-1 left-1 size-6 rounded-full bg-white shadow-sm transition-transform ${
                    value.luggage ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
            <PickerFooter doneLabel={text.done} onDone={close} />
          </div>
        )}
      </Picker>
      {submit
        ? partyParams(value).map(([key, param]) => <input key={key} type="hidden" name={key} value={param} />)
        : null}
    </>
  );
}

type StepButtonProps = {
  label: string;
  disabled: boolean;
  autoFocus?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function StepButton({ label, disabled, autoFocus, onClick, children }: StepButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      data-autofocus={autoFocus ? true : undefined}
      onClick={onClick}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-ink/20 hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/20 min-[400px]:size-9"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        {children}
      </svg>
    </button>
  );
}
