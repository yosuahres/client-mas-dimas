import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import jomblang from "@/assets/photos/jomblang.jpg";
import kraton from "@/assets/photos/kraton.jpg";
import merapi from "@/assets/photos/merapi.jpg";
import prambanan from "@/assets/photos/prambanan.jpg";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getHomePhotos } from "@/lib/content/public";
import { tourInterests, type TourInterest } from "@/lib/tours";

/** Shown until the client replaces a tile's photo in /admin/home-photos. */
const builtInPhotos: Record<TourInterest, StaticImageData> = {
  temples: prambanan,
  culture: kraton,
  nature: merapi,
  adventure: jomblang,
};

// Four rounded photo tiles on a green band, each opening the tour list filtered to one interest. Phones and small
// tablets: a row to swipe, the next one peeking in; from 768px a 2×2 grid, from 1024px one row of four.
export async function FirstStepSection() {
  const locale = await getLocale();
  const t = (await getDictionary()).firstStep;
  const homePhotos = await getHomePhotos();

  return (
    <section aria-labelledby="first-step-title" className="bg-jade text-white">
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-20">
        <h2 id="first-step-title" className="display text-[1.85rem] sm:text-[clamp(2.25rem,4.5vw,3.5rem)]">
          {t.left} <span className="text-white/65">{t.right}</span>
        </h2>

        <ul className="-mx-5 mt-6 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:mt-10 sm:scroll-px-8 sm:gap-4 sm:px-8 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4 md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {tourInterests.map((interest) => {
            const tile = t.tiles[interest];
            const replaced = homePhotos[interest];
            return (
              <li key={interest} className="w-[78%] shrink-0 snap-start sm:w-[60%] md:w-auto">
                <Link
                  href={`${localePath(locale, "/tours")}?interest=${interest}`}
                  className="group relative isolate flex aspect-4/5 flex-col items-start justify-end overflow-hidden rounded-3xl p-6 text-white sm:aspect-[66/52] sm:p-8 lg:aspect-4/5 lg:p-6"
                >
                  <Image
                    src={replaced ?? builtInPhotos[interest]}
                    alt=""
                    placeholder={replaced ? "empty" : "blur"}
                    fill
                    sizes="(min-width: 1024px) 23vw, (min-width: 768px) 46vw, 80vw"
                    className="-z-10 object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/65 via-black/15 to-transparent" />
                  <span className="kicker text-[0.95rem] text-white/85">{tile.kicker}</span>
                  <span className="display mt-1.5 text-[2.25rem] sm:text-[clamp(2.5rem,4.5vw,3.5rem)] lg:text-[2.25rem]">{tile.title}</span>
                  <span className="pill mt-5 bg-white/90 px-4 py-2.5 text-[0.9rem] text-ink backdrop-blur-sm group-hover:bg-white">
                    {tile.cta}
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
