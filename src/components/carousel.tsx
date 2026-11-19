"use client";

import Link from "next/link";
import { Children, useRef, type MouseEvent, type PointerEvent, type ReactNode } from "react";

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

// A row of cards that runs off the right edge of the page. Swipe it on touch screens, drag it with a mouse,
// or scroll it with a trackpad or the keyboard. Screens with a mouse also get arrow buttons by the heading.

// How far the mouse must move before a press counts as a drag rather than a click on a card
const DRAG_THRESHOLD = 6;
export function Carousel({ titleId, title, intro, viewAll, previousLabel, nextLabel, children }: CarouselProps) {
  const rowRef = useRef<HTMLUListElement>(null);
  const drag = useRef({ pointerId: -1, startX: 0, startScroll: 0, moved: false });

  const scrollByPage = (direction: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: direction * row.clientWidth * 0.75, behavior: "smooth" });
  };

  // Touch already swipes natively; this gives a mouse the same feel. Snapping is paused while dragging,
  // then the row glides to the nearest card.
  const startDrag = (event: PointerEvent<HTMLUListElement>) => {
    const row = rowRef.current;
    if (!row || event.pointerType !== "mouse" || event.button !== 0) return;
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startScroll: row.scrollLeft, moved: false };
  };

  const moveDrag = (event: PointerEvent<HTMLUListElement>) => {
    const row = rowRef.current;
    const state = drag.current;
    if (!row || event.pointerId !== state.pointerId) return;
    const distance = event.clientX - state.startX;
    if (!state.moved && Math.abs(distance) < DRAG_THRESHOLD) return;
    if (!state.moved) {
      state.moved = true;
      row.setPointerCapture(event.pointerId);
      row.style.scrollSnapType = "none";
      row.style.cursor = "grabbing";
    }
    row.scrollLeft = state.startScroll - distance;
  };

  const endDrag = (event: PointerEvent<HTMLUListElement>) => {
    const row = rowRef.current;
    const state = drag.current;
    if (!row || event.pointerId !== state.pointerId) return;
    state.pointerId = -1;
    if (!state.moved) return;
    row.style.cursor = "";
    const target = nearestCardLeft(row);
    row.scrollTo({ left: target, behavior: "smooth" });
    // Turn snapping back on once the glide has settled, so it doesn't cut the animation short
    window.setTimeout(() => {
      row.style.scrollSnapType = "";
    }, 400);
  };

  // A drag that ends over a card must not open it
  const swallowClickAfterDrag = (event: MouseEvent<HTMLUListElement>) => {
    if (!drag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    drag.current.moved = false;
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
          <div className="flex gap-2 pointer-coarse:hidden">
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
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={swallowClickAfterDrag}
        onDragStart={(event) => event.preventDefault()}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-(--gutter) gap-7 overflow-x-auto px-(--gutter) pb-2 select-none pointer-fine:cursor-grab"
      >
        {Children.map(children, (child) => (
          <li className="w-[80%] shrink-0 snap-start sm:w-[44%] lg:w-[calc((min(100vw,80rem)-4rem-5.25rem)/4)]">{child}</li>
        ))}
      </ul>
    </div>
  );
}

// Where the row should rest so the card nearest its left edge lines up with the snap padding
function nearestCardLeft(row: HTMLUListElement) {
  const padding = parseFloat(getComputedStyle(row).scrollPaddingLeft) || 0;
  const rowLeft = row.getBoundingClientRect().left;
  let best = row.scrollLeft;
  let bestGap = Infinity;
  for (const card of Array.from(row.children)) {
    const left = row.scrollLeft + card.getBoundingClientRect().left - rowLeft - padding;
    const gap = Math.abs(left - row.scrollLeft);
    if (gap < bestGap) {
      bestGap = gap;
      best = left;
    }
  }
  return Math.max(0, Math.min(best, row.scrollWidth - row.clientWidth));
}
