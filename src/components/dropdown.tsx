"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type DropdownOption = { value: string; label: string };
export type DropdownGroup = { label: string; options: DropdownOption[] };

type DropdownProps = {
  /** id of the visible label that names this control. */
  labelledBy: string;
  id?: string;
  /** When set, the value is also submitted with the surrounding form under this name. */
  name?: string;
  value: string;
  onChange: (value: string) => void;
  /** Either a flat list of options, or options in labelled groups. */
  options?: DropdownOption[];
  groups?: DropdownGroup[];
  placeholder?: string;
};

// A styled replacement for <select>, following the WAI-ARIA "select-only combobox" pattern:
// focus stays on the button, arrow keys move through the options, Enter picks, Escape closes,
// and typing a letter jumps to the next option that starts with it.
// Place it inside a positioned box: the button stretches over that box and the list opens below it.
export function Dropdown({ labelledBy, id, name, value, onChange, options, groups, placeholder }: DropdownProps) {
  const sections: DropdownGroup[] = groups ?? [{ label: "", options: options ?? [] }];
  const flat = sections.flatMap((section) => section.options);
  const selectedIndex = flat.findIndex((option) => option.value === value);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const openList = () => {
    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = flat[index];
    if (option) onChange(option.value);
    setOpen(false);
  };

  // Close when the pointer goes down anywhere outside
  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open]);

  // Keep the highlighted option visible while moving through a long list
  useEffect(() => {
    if (open) document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
    // optionId only depends on baseId, which never changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex]);

  const jumpToLetter = (letter: string) => {
    const lower = letter.toLowerCase();
    for (let step = 1; step <= flat.length; step++) {
      const index = (activeIndex + step) % flat.length;
      if (flat[index].label.toLowerCase().startsWith(lower)) return index;
    }
    return activeIndex;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = flat.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) setActiveIndex(jumpToLetter(event.key));
    }
  };

  const selected = flat[selectedIndex];
  let runningIndex = 0;

  return (
    <div ref={containerRef} className="contents">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-labelledby={labelledBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 text-left font-medium outline-none after:absolute after:inset-0"
      >
        <span className={`truncate ${selected ? "" : "font-normal text-ink-muted"}`}>{selected?.label ?? placeholder}</span>
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className={`size-4 shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <div
        id={listId}
        role="listbox"
        aria-labelledby={labelledBy}
        hidden={!open}
        className="absolute top-full right-0 left-0 z-40 mt-2 max-h-80 min-w-64 overflow-y-auto rounded-2xl border border-ink/10 bg-white p-1.5 text-ink shadow-[0_24px_50px_-20px_rgb(0_0_0/0.3)]"
      >
        {sections.map((section, sectionIndex) => {
          const groupLabelId = `${baseId}-group-${sectionIndex}`;
          const items = section.options.map((option) => {
            const index = runningIndex++;
            const isSelected = index === selectedIndex;
            return (
              <div
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                data-active={open && index === activeIndex}
                // Keep focus on the button so the keyboard keeps working after a click
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 data-[active=true]:bg-cream aria-selected:font-medium"
              >
                {option.label}
                {isSelected ? (
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4 shrink-0">
                    <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                ) : null}
              </div>
            );
          });
          if (!section.label) return items;
          return (
            <div key={section.label} role="group" aria-labelledby={groupLabelId}>
              <div id={groupLabelId} className="label px-3 pt-3 pb-1 text-[0.75rem] text-ink-muted">
                {section.label}
              </div>
              {items}
            </div>
          );
        })}
      </div>
    </div>
  );
}
