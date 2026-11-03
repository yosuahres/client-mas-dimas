import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getPlaces, getPopularRoutes, getTransferVehicles } from "@/lib/content/public";
import { formatIdr } from "@/lib/money";
import { estimateRoute, findPlace, quoteTransfer, transferHref } from "@/lib/transfers";

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
    const { distanceKm } = estimateRoute(from, to);
    const [cheapest] = quoteTransfer(vehicles, distanceKm);
    return { ...route, fromName: from.name, toName: to.name, distanceKm, price: formatIdr(cheapest.totalIdr, locale) };
  });

  return (
    <section aria-labelledby="transfers-title" className="px-3">
      <div className="mx-auto grid max-w-[90rem] items-center gap-14 rounded-3xl bg-cream px-6 py-20 sm:px-12 sm:py-24 lg:grid-cols-2 lg:px-20">
        <div>
          <p className="kicker text-ink-muted">{t.label}</p>
          <h2 id="transfers-title" className="display mt-3 text-[clamp(2.5rem,5vw,4rem)]">
            {t.title}
          </h2>
          <p className="mt-6 max-w-xl text-[1.15rem] leading-[1.55]">{t.body}</p>
          <Link href={transferPath} className="pill mt-9 bg-jade text-white hover:bg-jade/90">
            {t.cta}
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        <div className="relative">
          <div className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.25)] sm:p-9">
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
