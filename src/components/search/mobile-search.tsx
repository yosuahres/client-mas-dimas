"use client";

import Image, { type StaticImageData } from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import merapi from "@/assets/photos/merapi.jpg";
import prambanan from "@/assets/photos/prambanan.jpg";
import { ArrowLeftIcon, CarIcon, MapIcon } from "@/components/icons";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

import type { SearchMode } from "./trip-search";

// Phones, like the tiket.com app: tap the "Tour packages" or "Airport & transfers" tile, then that search
// opens as its own full screen. The open screen lives in the URL (?search=tours), so the phone's back
// button closes it, and a shared link opens it directly.

const PARAM = "search";
const WIDE = "(min-width: 40rem)";
const modes: SearchMode[] = ["tours", "transfer"];

// Whether this tab opened the screen itself, so closing can step back instead of leaving a history entry behind
let openedHere = false;

const icons: Record<SearchMode, ReactNode> = {
  tours: <MapIcon className="size-7" />,
  transfer: <CarIcon className="size-7" />,
};

// Without JavaScript the options are plain links to the pages that hold each search
const fallbackPaths: Record<SearchMode, string> = { tours: "/tours", transfer: "/transfer" };

type ChooserProps = {
  locale: Locale;
  text: Dictionary["search"];
};

export function MobileSearchChooser({ locale, text }: ChooserProps) {
  const open = (mode: SearchMode) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openedHere = true;
    window.history.pushState(null, "", `${window.location.pathname}?${PARAM}=${mode}`);
  };

  return (
    <nav aria-label={text.label} className="grid grid-cols-2 gap-2.5 text-ink">
      {modes.map((mode) => (
        <a
          key={mode}
          href={localePath(locale, fallbackPaths[mode])}
          onClick={open(mode)}
          className="flex flex-col items-center rounded-2xl bg-white px-3 pt-4 pb-3.5 text-center shadow-[0_6px_20px_-14px_rgb(0_0_0/0.3)] hover:bg-sand active:scale-[0.98]"
        >
          <span aria-hidden="true" className="grid size-14 place-items-center rounded-full bg-jade text-white">
            {icons[mode]}
          </span>
          <span className="mt-2.5 font-medium leading-tight">{text.tabs[mode]}</span>
          <span className="mt-1 text-[0.8rem] leading-snug text-ink-muted">{text.tabHints[mode]}</span>
        </a>
      ))}
    </nav>
  );
}

type ScreenProps = {
  text: Dictionary["search"];
  /** The search form for this mode, laid out for phones. */
  renderForm: (mode: SearchMode) => ReactNode;
  /** Under the form, inside the white card: this tab's recent searches. */
  renderRecent?: (mode: SearchMode) => ReactNode;
  /** Under the card, so the screen isn't empty: packages with prices, popular routes. */
  extras?: Partial<Record<SearchMode, ReactNode>>;
};

const photos: Record<SearchMode, StaticImageData> = { tours: prambanan, transfer: merapi };

/**
 * Laid out like the tiket.com app's search screens: a photo with a round back button and the title, a white
 * card with the form overlapping it, recent searches, then things to browse. Covers the whole phone screen.
 * Render inside Suspense: it reads ?search= from the URL.
 */
export function MobileSearchScreen({ text, renderForm, renderRecent, extras }: ScreenProps) {
  const params = useSearchParams();
  const requested = params.get(PARAM);
  const mode = modes.find((value) => value === requested) ?? null;
  const backRef = useRef<HTMLButtonElement>(null);

  // Phones only: keep the page still behind the screen, and start keyboard focus on Back
  useEffect(() => {
    if (!mode || window.matchMedia(WIDE).matches) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    backRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [mode]);

  if (!mode) return null;

  const close = () => {
    if (openedHere) {
      openedHere = false;
      window.history.back();
      return;
    }
    // Opened from a link or a reload: drop the parameter without leaving the page
    window.history.replaceState(null, "", window.location.pathname);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-search-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") close();
      }}
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-cream text-ink motion-safe:animate-appear sm:hidden"
    >
      <div className="relative h-48 bg-ink">
        <Image src={photos[mode]} alt="" placeholder="blur" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-black/25" />
        <button
          ref={backRef}
          type="button"
          onClick={close}
          aria-label={text.back}
          className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 grid size-11 place-items-center rounded-full bg-white text-ink shadow-[0_4px_14px_-4px_rgb(0_0_0/0.35)]"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
        <h2 id="mobile-search-title" className="absolute bottom-10 left-5 text-[1.75rem] leading-tight font-medium text-white">
          {text.tabs[mode]}
        </h2>
      </div>

      <div className="relative -mt-6 rounded-t-3xl bg-white px-4 pt-5 pb-6">
        {renderForm(mode)}
        {renderRecent?.(mode)}
      </div>

      {extras?.[mode] ? <div className="px-4 pt-7 pb-[max(2rem,env(safe-area-inset-bottom))]">{extras[mode]}</div> : null}
    </div>,
    document.body,
  );
}
