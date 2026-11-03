import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { tourHref, type Tour } from "@/lib/tours";

type RowText = Dictionary["tourRow"];

/** In listings the price stays on the package page; this line gives a reason to open it. */
export function PriceTeaser({ text }: { text: RowText }) {
  return <p className="text-[0.95rem] text-ink-muted">{text.teaser}</p>;
}

// One package in the list. The photo repeats the title link, so it's hidden from keyboard and screen readers.
export function TourRow({ tour, locale, text, lengthLabel }: { tour: Tour; locale: Locale; text: RowText; lengthLabel: string }) {
  const href = tourHref(locale, tour);
  return (
    <article className="grid gap-5 py-7 sm:grid-cols-[11rem_1fr] lg:grid-cols-[13rem_1fr_13rem_auto] lg:items-center lg:gap-8">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative aspect-4/3 overflow-hidden rounded-2xl bg-sand">
        {tour.photo ? (
          <Image src={tour.photo} alt="" fill sizes="(min-width: 1024px) 13rem, 11rem" className="object-cover" />
        ) : null}
      </Link>
      <div>
        <p className="label text-ink-muted">
          {tour.code} · {lengthLabel}
        </p>
        <h3 className="mt-1.5 text-xl leading-snug font-medium tracking-[-0.03em]">
          <Link href={href} className="hover:underline hover:underline-offset-4">
            {tour.name}
          </Link>
        </h3>
        <p className="mt-1.5 text-ink-muted">{tour.summary}</p>
        <p className="mt-2 text-[0.95rem]">{tour.destinations.join(" · ")}</p>
      </div>
      <div className="sm:col-start-2 lg:col-start-auto">
        <PriceTeaser text={text} />
      </div>
      <Link
        href={href}
        className="pill justify-self-start border border-ink/15 px-4 py-2.5 text-[0.9rem] hover:border-ink/40 sm:col-start-2 lg:col-start-auto"
      >
        {text.cta}
      </Link>
    </article>
  );
}
