"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type TouchEvent } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { fill } from "@/i18n/format";

export type GridPhoto = {
  id: string;
  url: string;
  caption: string;
};

type PhotoGridText = {
  open: string;
  close: string;
  previous: string;
  next: string;
  counter: string;
};

type PhotoGridProps = {
  photos: GridPhoto[];
  text: PhotoGridText;
  /** The photos' alt text when one has no caption, e.g. the article's title. */
  fallbackAlt?: string;
};

// Rounded photo tiles with their captions; tapping one opens it full screen. Arrows, the arrow keys or a swipe
// step through the rest, and Escape, the close button or the backdrop closes it.
export function PhotoGrid({ photos, text, fallbackAlt = "" }: PhotoGridProps) {
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open !== null && !element.open) element.showModal();
    if (open === null && element.open) element.close();
  }, [open]);

  const step = (by: number) => setOpen((index) => (index === null ? null : (index + by + photos.length) % photos.length));
  const current = open === null ? null : photos[open];

  function onTouchEnd(event: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (start === null) return;
    const distance = event.changedTouches[0].clientX - start;
    if (Math.abs(distance) > 50) step(distance < 0 ? 1 : -1);
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              aria-label={fill(text.open, { n: index + 1 })}
              className="group relative block aspect-4/3 w-full overflow-hidden rounded-2xl bg-sand"
            >
              <Image
                src={photo.url}
                alt={photo.caption || fallbackAlt}
                fill
                sizes="(min-width: 1024px) 30vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>
            {photo.caption ? <p className="mt-2.5 line-clamp-2 text-[0.95rem] leading-snug text-ink-muted">{photo.caption}</p> : null}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={current?.caption || fallbackAlt || undefined}
        onClose={() => setOpen(null)}
        onClick={(event) => {
          // A click on the dark backdrop, not on the photo or the buttons
          if (event.target === event.currentTarget) setOpen(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
        }}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0].clientX;
        }}
        onTouchEnd={onTouchEnd}
        className="m-0 size-full max-h-none max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
      >
        {current ? (
          <div className="flex size-full flex-col" onClick={(event) => event.target === event.currentTarget && setOpen(null)}>
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <p className="text-sm text-white/70 tabular-nums">{fill(text.counter, { n: (open ?? 0) + 1, total: photos.length })}</p>
              <button type="button" onClick={() => setOpen(null)} className="pill bg-white/10 px-4 py-2 text-[0.9rem] hover:bg-white/20">
                {text.close}
              </button>
            </div>
            <div className="relative min-h-0 flex-1" onClick={(event) => event.target === event.currentTarget && setOpen(null)}>
              <Image key={current.id} src={current.url} alt={current.caption || fallbackAlt} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex items-center gap-4 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={text.previous}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <ArrowLeftIcon className="size-4" />
              </button>
              <p className="min-w-0 flex-1 text-center text-[0.95rem] text-white/85">{current.caption}</p>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={text.next}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
