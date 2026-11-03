import Image from "next/image";
import Link from "next/link";

import { Carousel } from "@/components/carousel";
import { PriceTeaser } from "@/components/tour/tour-row";
import { localePath } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { getTours } from "@/lib/content/public";
import { tourHref } from "@/lib/tours";

export async function ToursSection() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.toursSection;
  const tours = await getTours(locale);

  return (
    <section id="tours" aria-labelledby="tours-title" className="scroll-mt-6 py-20 sm:py-28">
      <Carousel
        titleId="tours-title"
        title={t.title}
        intro={t.intro}
        viewAll={{ href: localePath(locale, "/tours"), label: t.viewAll }}
        previousLabel={t.previous}
        nextLabel={t.next}
      >
        {tours.map((tour) => {
          const href = tourHref(locale, tour);
          return (
            <article key={tour.slug}>
              {/* The photo repeats the title link, so it's hidden from keyboard and screen readers */}
              <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-4/3 overflow-hidden rounded-2xl bg-sand">
                {tour.photo ? (
                  <Image
                    src={tour.photo}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 80vw"
                    className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                  />
                ) : null}
              </Link>
              <p className="label mt-4 flex justify-between gap-4 text-ink-muted">
                <span>{dict.catalog.lengths[tour.length]}</span>
                <span>{fill(dict.tourPage.packageCode, { code: tour.code })}</span>
              </p>
              <h3 className="mt-1.5 text-[1.35rem] leading-[1.2] font-normal tracking-[-0.02em]">
                <Link href={href} className="hover:underline hover:underline-offset-4">
                  {tour.name}
                </Link>
              </h3>
              <div className="mt-2">
                <PriceTeaser text={dict.tourRow} />
                <Link href={href} className="pill mt-4 border border-ink/15 px-4 py-2.5 text-[0.9rem] hover:border-ink/40">
                  {dict.tourRow.cta}
                </Link>
              </div>
            </article>
          );
        })}
      </Carousel>
    </section>
  );
}
