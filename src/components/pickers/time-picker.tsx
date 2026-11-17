"use client";

import type { ReactNode } from "react";

import type { Dictionary } from "@/i18n/dictionaries/en";

import { Picker, PickerFooter } from "./picker";

type TimePickerProps = {
  labelledBy: string;
  id?: string;
  /** When set, a picked time is also submitted with the surrounding form under this name. */
  name?: string;
  /** "HH:MM" on a 24-hour clock, or "" for no time yet. */
  value: string;
  onChange: (value: string) => void;
  text: Dictionary["pickers"];
};

const hours = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];

// Two taps instead of a scroll wheel: an hour from a grid, then the minutes in steps of 15.
export function TimePicker({ labelledBy, id, name, value, onChange, text }: TimePickerProps) {
  const [hour = "", minute = ""] = value ? value.split(":") : [];

  return (
    <>
      <Picker
        id={id}
        labelledBy={labelledBy}
        display={value || text.time.placeholder}
        isEmpty={!value}
        title={text.time.title}
        closeLabel={text.close}
        panelClassName="w-[19rem]"
      >
        {(close) => (
          <div>
            <p className="label text-[0.78rem] text-ink-muted">{text.time.hour}</p>
            <div role="group" aria-label={text.time.hour} className="mt-2 grid grid-cols-6 gap-1.5">
              {hours.map((option) => (
                <ChoiceButton
                  key={option}
                  selected={option === hour}
                  autoFocus={hour ? option === hour : option === "08"}
                  onClick={() => onChange(`${option}:${minute || "00"}`)}
                >
                  {option}
                </ChoiceButton>
              ))}
            </div>

            <p className="label mt-4 text-[0.78rem] text-ink-muted">
              {text.time.minute}
              {hour ? null : <span className="font-normal"> · {text.time.minuteHint}</span>}
            </p>
            <div role="group" aria-label={text.time.minute} className="mt-2 grid grid-cols-4 gap-1.5">
              {minutes.map((option) => (
                <ChoiceButton
                  key={option}
                  selected={option === minute}
                  disabled={!hour}
                  onClick={() => {
                    onChange(`${hour}:${option}`);
                    close();
                  }}
                >
                  :{option}
                </ChoiceButton>
              ))}
            </div>

            <PickerFooter
              clearLabel={text.clear}
              onClear={value ? () => onChange("") : undefined}
              doneLabel={text.done}
              onDone={close}
            />
          </div>
        )}
      </Picker>
      {name && value ? <input type="hidden" name={name} value={value} /> : null}
    </>
  );
}

type ChoiceButtonProps = {
  selected: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  onClick: () => void;
  children: ReactNode;
};

function ChoiceButton({ selected, disabled, autoFocus, onClick, children }: ChoiceButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      data-autofocus={autoFocus ? true : undefined}
      onClick={onClick}
      className={`h-11 rounded-xl text-[0.95rem] tabular-nums sm:h-10 ${
        selected ? "bg-jade font-medium text-white" : "bg-cream hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-cream"
      }`}
    >
      {children}
    </button>
  );
}
