import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import jomblang from "@/assets/photos/jomblang.jpg";
import kraton from "@/assets/photos/kraton.jpg";
import merapi from "@/assets/photos/merapi.jpg";
import prambanan from "@/assets/photos/prambanan.jpg";
import { ArrowRightIcon } from "@/components/icons";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { tourInterests, type TourInterest } from "@/lib/tours";

const tilePhotos: Record<TourInterest, StaticImageData> = {
  temples: prambanan,
  culture: kraton,
  nature: merapi,
  adventure: jomblang,
};

// Four big rounded photo tiles, each opening the tour list filtered to one interest.
export async function FirstStepSection() {
  const locale = await getLocale();
  const t = (await getDictionary()).firstStep;

  return (
    <section aria-labelledby="first-step-title">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <h2 id="first-step-title" className="display text-[clamp(2.25rem,4.5vw,3.5rem)]">
          {t.left} <span className="text-ink-muted">{t.right}</span>
        </h2>

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {tourInterests.map((interest) => {
            const tile = t.tiles[interest];
            return (
              <li key={interest}>
                <Link
                  href={`${localePath(locale, "/tours")}?interest=${interest}`}
                  className="group relative isolate flex aspect-4/3 flex-col items-start justify-end overflow-hidden rounded-3xl p-6 text-white sm:aspect-[66/52] sm:p-8"
                >
                  <Image
                    src={tilePhotos[interest]}
                    alt=""
                    placeholder="blur"
                    fill
                    sizes="(min-width: 768px) 46vw, 100vw"
                    className="-z-10 object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/65 via-black/15 to-transparent" />
                  <span className="kicker text-[0.95rem] text-white/85">{tile.kicker}</span>
                  <span className="display mt-1.5 text-[clamp(2.5rem,4.5vw,3.5rem)]">{tile.title}</span>
                  <span className="pill mt-5 bg-white/90 px-4 py-2.5 text-[0.9rem] text-ink backdrop-blur-sm group-hover:bg-white">
                    {tile.cta}
                    <ArrowRightIcon className="size-3.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
