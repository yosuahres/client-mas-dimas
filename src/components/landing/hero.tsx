import Image from "next/image";

import { WhatsappIcon } from "@/components/icons";
import { TripSearch } from "@/components/search/trip-search";
import { getDictionary, getLocale } from "@/i18n/server";
import { getPlaces, getSite, getTours, getTransferVehicles } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";

// A photo in a rounded frame filling the first screen under the header: a calm headline, a short intro,
// and the trip search on a white card, so the search is always visible without scrolling.
export async function Hero() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.hero;
  const [tours, places, vehicles, site] = await Promise.all([
    getTours(locale),
    getPlaces(locale),
    getTransferVehicles(),
    getSite(),
  ]);
  const [featuredTour] = tours;
  const credit = featuredTour.photoCredit;
  const fromCommons = credit?.source.includes("commons.wikimedia.org") ?? false;

  return (
    <section aria-labelledby="hero-title" className="px-3 pt-3">
      {/* Only the photo layer is clipped to the rounded frame, so dropdowns in the search can open past its edge */}
      <div className="relative isolate mx-auto flex min-h-[calc(100svh-5.75rem)] max-w-[90rem] flex-col justify-end rounded-3xl text-white lg:min-h-[calc(100svh-6.25rem)]">
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl bg-ink">
          {featuredTour.photo ? (
            <Image
              src={featuredTour.photo}
              alt={featuredTour.photoAlt}
              priority
              fill
              sizes="100vw"
              className="object-cover object-[70%_40%]"
            />
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-black/5" />
        </div>
        {credit ? (
          <p className="absolute top-4 right-4 rounded-full bg-black/40 px-3 py-1 text-[0.75rem] text-white/85 backdrop-blur-sm">
            {credit.author}
            {fromCommons ? " / Wikimedia Commons" : null}
          </p>
        ) : null}

        <div className="w-full px-4 pt-10 pb-4 sm:px-8 sm:pb-8 lg:px-12">
          <p className="kicker text-[0.95rem] text-white/85 animate-rise sm:text-[1.05rem]">{t.kicker}</p>
          <h1 id="hero-title" className="display mt-2 text-[clamp(3.25rem,8vw,7rem)] animate-rise [animation-delay:100ms]">
            {t.title}
          </h1>
          {/* Phones skip the intro so the search still fits on the first screen; the floating WhatsApp button covers chat */}
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

          <div className="mt-5 animate-rise [animation-delay:260ms] sm:mt-7">
            <p className="label mb-2.5 px-1 text-white/85">
              {dict.search.bandLeft} <span className="text-white/60">{dict.search.bandRight}</span>
            </p>
            <TripSearch
              locale={locale}
              text={dict.search}
              transferText={dict.transfer}
              tours={tours.map(({ slug, name, destinations }) => ({ slug, name, destinations }))}
              places={places}
              vehicles={vehicles}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
