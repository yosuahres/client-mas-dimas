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
          Phones: a wide photo, then the search as a white bar of two tabs right under it */}
      <div className="relative isolate flex flex-col justify-end text-white sm:min-h-svh">
        <div className="absolute inset-x-0 top-0 -z-10 h-[56vw] overflow-hidden bg-ink sm:inset-y-0 sm:h-auto">
          {photo ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              priority
              fill
              sizes="100vw"
              className="object-cover object-[70%_40%]"
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-black/5" />
          {/* Darkens the top so the white header text reads over bright sky */}
          <div className="absolute inset-x-0 top-0 hidden h-40 bg-linear-to-b from-black/45 to-transparent sm:block" />
        </div>

        <div className="mx-auto w-full max-w-[90rem] pt-[56vw] sm:px-8 sm:pt-28 sm:pb-[clamp(2rem,12svh,9rem)] lg:px-12">
          <p className="kicker text-[1.05rem] text-white/85 animate-rise max-sm:hidden">{t.kicker}</p>
          {/* Phones show only the photo; the h1 stays for screen readers */}
          <h1 id="hero-title" className="display mt-2 text-[clamp(3.25rem,8vw,7rem)] animate-rise [animation-delay:100ms] max-sm:sr-only">
            {t.title}
          </h1>
          {/* Phones skip the intro; the floating WhatsApp button covers chat */}
          <div className="mt-4 hidden flex-wrap items-end justify-between gap-x-10 gap-y-3 animate-rise [animation-delay:180ms] sm:flex">
            <p className="max-w-2xl text-[1.1rem] leading-[1.5] text-white/90">{t.lede}</p>
            <a
              href={whatsappLink(site, t.planMessage)}
              className="pill shrink-0 bg-white/15 text-white backdrop-blur-md hover:bg-white/25"
            >
              <WhatsappIcon className="size-4" />
              {t.planOnWhatsapp}
            </a>
          </div>

          {/* Phones: folded to the two tabs until one is tapped */}
          <div className="animate-rise [animation-delay:260ms] sm:mt-7">
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
