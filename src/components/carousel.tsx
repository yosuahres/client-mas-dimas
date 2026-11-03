"use client";

import Link from "next/link";
import { Children, useRef, type ReactNode } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";

type CarouselProps = {
  titleId: string;
  title: string;
  intro?: string;
  viewAll: { href: string; label: string };
  previousLabel: string;
  nextLabel: string;
  children: ReactNode;
};

// A row of cards that runs off the right edge of the page, with square arrow buttons by the heading.
// The row scrolls natively too (touch, trackpad, keyboard), so the buttons are a convenience.
export function Carousel({ titleId, title, intro, viewAll, previousLabel, nextLabel, children }: CarouselProps) {
  const rowRef = useRef<HTMLUListElement>(null);

  const scrollByPage = (direction: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction * row.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-10 gap-y-6 px-5 sm:px-8">
        <div className="max-w-3xl">
          <h2 id={titleId} className="display text-[clamp(2.25rem,4.5vw,3.5rem)]">
            {title}
          </h2>
          {intro ? <p className="mt-5 text-[1.1rem] text-ink-muted">{intro}</p> : null}
        </div>
        <div className="flex items-center gap-8">
          <Link href={viewAll.href} className="pill border border-ink/15 px-4 py-2.5 hover:border-ink/40">
            {viewAll.label}
          </Link>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label={previousLabel}
              className="grid size-11 place-items-center rounded-full border border-ink/15 hover:border-ink/40"
            >
              <ArrowLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label={nextLabel}
              className="grid size-11 place-items-center rounded-full bg-ink text-white hover:bg-ink/85"
            >
              <ArrowRightIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={rowRef}
        aria-labelledby={titleId}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-(--gutter) gap-7 overflow-x-auto px-(--gutter) pb-2"
      >
        {Children.map(children, (child) => (
          <li className="w-[80%] shrink-0 snap-start sm:w-[44%] lg:w-[calc((min(100vw,80rem)-4rem-5.25rem)/4)]">{child}</li>
        ))}
      </ul>
    </div>
  );
}
