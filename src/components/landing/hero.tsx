import Image from "next/image";

import { WhatsappIcon } from "@/components/icons";
import { TourShortlist } from "@/components/search/tour-shortlist";
import { TripSearch } from "@/components/search/trip-search";
import { getDictionary, getLocale } from "@/i18n/server";
import { getHomePhotos, getPlaces, getSite, getTours } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";

// A photo in a rounded frame filling the first screen under the header: a calm headline, a short intro,
// and the trip search on a white card, so the search is always visible without scrolling.
export async function Hero() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.hero;
  const [tours, places, site, homePhotos] = await Promise.all([getTours(locale), getPlaces(locale), getSite(), getHomePhotos()]);
  const [featuredTour] = tours;
  // The photo set in /admin/home-photos, otherwise the first package's
  const photo = homePhotos.hero
    ? { src: homePhotos.hero, alt: t.photoAlt }
    : featuredTour.photo
      ? { src: featuredTour.photo, alt: featuredTour.photoAlt }
      : null;

  return (
    <section aria-labelledby="hero-title">
      {/* The photo runs edge to edge with square corners. Only the photo layer clips, so dropdowns in the search can open past it.
          Phones: a tall photo with the title on its lower part, and the search card overlapping its bottom edge */}
      <div className="relative isolate flex flex-col justify-end text-white sm:min-h-svh">
        <div className="absolute inset-x-0 top-0 -z-10 h-[78vw] overflow-hidden bg-ink sm:inset-y-0 sm:h-auto">
          {photo ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              priority
              fill
              sizes="100vw"
              className="object-cover object-[70%_40%] opacity-70"
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-black/5" />
          {/* Darkens the top so the white header text reads over bright sky */}
          <div className="absolute inset-x-0 top-0 hidden h-40 bg-linear-to-b from-black/45 to-transparent sm:block" />
        </div>

        <div className="mx-auto w-full max-w-[90rem] px-4 pt-[30vw] sm:px-8 sm:pt-28 sm:pb-[clamp(2rem,12svh,9rem)] lg:px-12">
          <p className="kicker text-[1.05rem] text-white/85 animate-rise">{t.kicker}</p>
          <h1 id="hero-title" className="display mt-1 text-[clamp(2.75rem,8vw,7rem)] sm:mt-2 animate-rise [animation-delay:100ms]">
            {t.title}
          </h1>
          {/* Phones skip this; the floating WhatsApp button covers chat */}
          <div className="mt-6 hidden animate-rise [animation-delay:180ms] sm:flex">
            <a
              href={whatsappLink(site, t.planMessage)}
              className="pill shrink-0 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
            >
              <WhatsappIcon className="size-4" />
              {t.planOnWhatsapp}
            </a>
          </div>

          {/* Phones: open on the first tab; tapping the open tab folds it */}
          <div className="mt-4 animate-rise [animation-delay:260ms] sm:mt-7">
            <TripSearch
              locale={locale}
              text={dict.search}
              transferText={dict.transfer}
              pickerText={dict.pickers}
              showRecent
              collapsible
              phoneTours={<TourShortlist locale={locale} dict={dict} tours={tours} />}
              tours={tours.map(({ slug, name }) => ({ slug, name }))}
              places={places}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
