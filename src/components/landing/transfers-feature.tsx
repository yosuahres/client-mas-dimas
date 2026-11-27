import Link from "next/link";

import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getPlaces, getPopularRoutes, getTransferVehicles } from "@/lib/content/public";
import { formatIdr } from "@/lib/money";
import { cheapestCarPrice } from "@/lib/pricing";
import { findPlace, transferHref } from "@/lib/transfers";

// Text on the left; on the right a soft card of popular fares with a small badge.
export async function TransfersFeature() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.transfersFeature;
  const transferPath = localePath(locale, "/transfer");
  const [routes, places, vehicles] = await Promise.all([getPopularRoutes(), getPlaces(locale), getTransferVehicles()]);

  const fares = routes.slice(0, 5).map((route) => {
    // getPopularRoutes only returns routes whose both ends are published
    const from = findPlace(places, route.from)!;
    const to = findPlace(places, route.to)!;
    const cheapest = cheapestCarPrice(route.carPrices, vehicles);
    return { ...route, fromName: from.name, toName: to.name, price: cheapest === null ? dict.tourPage.onRequest : formatIdr(cheapest, locale) };
  });

  return (
    <section aria-labelledby="transfers-title" className="bg-peach">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-9 sm:gap-14 sm:px-8 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="kicker text-ink-muted">{t.label}</p>
          <h2 id="transfers-title" className="display mt-2 text-[1.85rem] sm:mt-3 sm:text-[clamp(2.5rem,5vw,4rem)]">
            {t.title}
          </h2>
          <Link href={transferPath} className="pill mt-5 bg-jade sm:mt-9 text-white hover:bg-jade/90">
            {t.cta}
          </Link>
        </div>

        <div className="relative">
          <div className="rounded-2xl bg-white p-5 sm:rounded-3xl sm:p-9 sm:shadow-[0_24px_60px_-30px_rgb(0_0_0/0.25)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-lg font-medium">{t.cardTitle}</p>
              <p className="label rounded-full bg-wheat px-3 py-1 text-[0.8rem]">{t.sticky}</p>
            </div>
            <ul className="mt-5 divide-y divide-ink/10">
              {fares.map((fare) => (
                <li key={`${fare.from}-${fare.to}`}>
                  <Link
                    href={transferHref(transferPath, fare)}
                    className="flex items-baseline justify-between gap-4 py-3.5 hover:underline hover:underline-offset-4"
                  >
                    <span>
                      {fare.fromName} <span aria-hidden="true">→</span> {fare.toName}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">{fare.price}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="label mt-4 text-ink-muted">{t.perCar}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
