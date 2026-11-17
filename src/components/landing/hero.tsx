import Image from "next/image";

import { WhatsappIcon } from "@/components/icons";
import { MobileSearchChooser } from "@/components/search/mobile-search";
import { RouteOffers, TourOffers } from "@/components/search/phone-offers";
import { TripSearch } from "@/components/search/trip-search";
import { getDictionary, getLocale } from "@/i18n/server";
import { getPlaces, getPopularRoutes, getSite, getTours, getTransferVehicles } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";

// A photo in a rounded frame filling the first screen under the header: a calm headline, a short intro,
// and the trip search on a white card, so the search is always visible without scrolling.
export async function Hero() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.hero;
  const [tours, places, site, routes, vehicles] = await Promise.all([
    getTours(locale),
    getPlaces(locale),
    getSite(),
    getPopularRoutes(),
    getTransferVehicles(),
  ]);
  const [featuredTour] = tours;

  return (
    <section aria-labelledby="hero-title">
      {/* The photo runs edge to edge with square corners. Only the photo layer clips, so dropdowns in the search can open past it.
          Phones: just a short strip, like the tiket.com app; the two tiles follow underneath */}
      <div className="relative isolate flex h-20 flex-col justify-end text-white sm:h-auto sm:min-h-svh">
        <div className="absolute inset-0 -z-10 overflow-hidden bg-ink">
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
          {/* Darkens the top so the white header text reads over bright sky */}
          <div className="absolute inset-x-0 top-0 hidden h-40 bg-linear-to-b from-black/45 to-transparent sm:block" />
        </div>

        <div className="mx-auto w-full max-w-[90rem] sm:px-8 sm:pt-28 sm:pb-8 lg:px-12">
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

          <div className="mt-7 animate-rise [animation-delay:260ms] max-sm:hidden">
            <TripSearch
              locale={locale}
              text={dict.search}
              transferText={dict.transfer}
              pickerText={dict.pickers}
              phoneScreen
              phoneExtras={{
                tours: <TourOffers locale={locale} dict={dict} tours={tours} />,
                transfer: <RouteOffers locale={locale} dict={dict} routes={routes} places={places} vehicles={vehicles} />,
              }}
              tours={tours.map(({ slug, name }) => ({ slug, name }))}
              places={places}
            />
          </div>
        </div>
      </div>

      {/* Phones: tour or transfer, each opening the search as its own screen */}
      <div className="mx-3 mt-3 rounded-3xl bg-cream p-2.5 sm:hidden">
        <MobileSearchChooser locale={locale} text={dict.search} />
      </div>
    </section>
  );
}
