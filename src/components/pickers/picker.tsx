"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

type PickerProps = {
  /** id of the visible label that names this control. */
  labelledBy: string;
  id?: string;
  /** What the closed control shows: the picked value, or the placeholder. */
  display: ReactNode;
  isEmpty: boolean;
  /** Heading of the bottom sheet on phones. */
  title: string;
  closeLabel: string;
  /** Width of the panel on wider screens. */
  panelClassName?: string;
  /** Which edge of the field the panel lines up with on wider screens. */
  align?: "start" | "end";
  children: (close: () => void) => ReactNode;
};

const WIDE = "(min-width: 40rem)";

const subscribeToWidth = (onChange: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

// Phones get a bottom sheet with large targets; wider screens get a panel under the field.
// The server renders the closed control only, so assuming a wide screen there changes nothing.
function useWideScreen() {
  return useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
}

const FOCUSABLE = 'button:not([disabled]):not([tabindex="-1"]), a[href], input:not([disabled]):not([type="hidden"]), [tabindex="0"]';

// A field that opens a panel instead of the browser's own date or time control, which is fiddly on phones.
// Place it inside a positioned box: the button stretches over that box and the panel opens below it.
export function Picker({
  labelledBy,
  id,
  display,
  isEmpty,
  title,
  closeLabel,
  panelClassName = "w-80",
  align = "start",
  children,
}: PickerProps) {
  const [open, setOpen] = useState(false);
  const wide = useWideScreen();
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const triggerId = id ?? `${baseId}-trigger`;
  const valueId = `${baseId}-value`;
  const panelId = `${baseId}-panel`;
  const titleId = `${baseId}-title`;

  const close = () => {
    setOpen(false);
    // Looked up by id rather than a ref: close is handed to the panel content while rendering
    document.getElementById(triggerId)?.focus({ preventScroll: true });
  };

  // Move focus into the panel, to the element marked data-autofocus if there is one
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const target = panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus({ preventScroll: true });
  }, [open, wide]);

  // Wide screens: close when the pointer goes down anywhere outside
  useEffect(() => {
    if (!open || !wide) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    return () => document.removeEventListener("pointerdown", closeOnOutside);
  }, [open, wide]);

  // Phones: keep the page still behind the sheet
  useEffect(() => {
    if (!open || wide) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open, wide]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key === "Tab" && !wide) keepFocusInside(event, panelRef.current);
  };

  // Wide screens: tabbing out of the panel closes it
  const closeWhenFocusLeaves = (event: FocusEvent<HTMLDivElement>) => {
    if (!wide || !open) return;
    if (event.relatedTarget instanceof Node && containerRef.current?.contains(event.relatedTarget)) return;
    if (event.relatedTarget) setOpen(false);
  };

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-modal={wide ? undefined : true}
      aria-labelledby={wide ? labelledBy : titleId}
      onKeyDown={handleKeyDown}
      className={
        wide
          ? `absolute top-full ${align === "end" ? "right-0" : "left-0"} z-40 mt-2 rounded-2xl border border-ink/10 bg-white p-4 text-ink shadow-[0_24px_50px_-20px_rgb(0_0_0/0.3)] ${panelClassName}`
          : "relative max-h-[88svh] overflow-y-auto rounded-t-3xl bg-white px-5 pt-2.5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink motion-safe:animate-sheet"
      }
    >
      {wide ? null : (
        <>
          <div aria-hidden="true" className="mx-auto h-1 w-10 rounded-full bg-ink/15" />
          <div className="mt-3 mb-4 flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-lg font-medium">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={closeLabel}
              className="-mr-2 grid size-10 place-items-center rounded-full text-ink-muted hover:bg-cream hover:text-ink"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="size-4">
                <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </>
      )}
      {children(close)}
    </div>
  );

  return (
    <div ref={containerRef} className="contents" onBlur={closeWhenFocusLeaves}>
      <button
        id={triggerId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-labelledby={`${labelledBy} ${valueId}`}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex w-full min-w-0 cursor-pointer items-center text-left font-medium outline-none after:absolute after:inset-0"
      >
        <span id={valueId} className={`truncate ${isEmpty ? "font-normal text-ink-muted" : ""}`}>
          {display}
        </span>
      </button>

      {open && wide ? panel : null}
      {open && !wide
        ? createPortal(
            <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col justify-end">
              {/* Pinned to the bottom edge, with a backdrop reaching well past the screen: on iPhones the
                  screen grows when the toolbar hides, and an inset-0 overlay would stop short of it */}
              <div aria-hidden="true" onClick={close} className="fixed inset-x-0 -top-[50vh] -bottom-[50vh] bg-black/40 motion-safe:animate-appear" />
              {panel}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

function keepFocusInside(event: KeyboardEvent, panel: HTMLElement | null) {
  const items = Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/** The footer every picker shares: an optional Clear on the left and Done on the right. */
export function PickerFooter({
  clearLabel,
  onClear,
  doneLabel,
  onDone,
}: {
  clearLabel?: string;
  onClear?: () => void;
  doneLabel: string;
  onDone: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
      {onClear && clearLabel ? (
        <button type="button" onClick={onClear} className="rounded-full px-3 py-2 font-medium underline underline-offset-4 hover:bg-cream">
          {clearLabel}
        </button>
      ) : (
        <span />
      )}
      <button type="button" onClick={onDone} className="pill bg-jade px-5 py-3 text-white hover:bg-jade/90">
        {doneLabel}
      </button>
    </div>
  );
}
