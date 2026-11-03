"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";

import { Dropdown } from "@/components/dropdown";
import { WhatsappIcon } from "@/components/icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill } from "@/i18n/format";
import type { Vehicle } from "@/lib/fleet";
import { formatApproxUsd, formatIdr } from "@/lib/money";
import { whatsappLink, type SiteSettings } from "@/lib/site";

type BookingCardProps = {
  tourName: string;
  priceFromIdr: number | null;
  locale: Locale;
  text: Dictionary["bookingCard"];
  priceText: Pick<Dictionary["tourPage"], "fromPrice" | "onRequest">;
  /** The cars to choose from, in the order set in the admin panel; the first is preselected. */
  fleet: Pick<Vehicle, "id" | "name" | "seats">[];
  site: Pick<SiteSettings, "whatsappNumber" | "idrPerUsd">;
  initialDate?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** The booking card, starting from the date picked in the site search (?date=YYYY-MM-DD). Render inside Suspense. */
export function BookingCardFromSearch(props: Omit<BookingCardProps, "initialDate">) {
  const date = useSearchParams().get("date");
  return <BookingCard {...props} initialDate={date && DATE_PATTERN.test(date) ? date : undefined} />;
}

// Until online checkout exists, the request goes out as a WhatsApp message and the client replies with the final price.
export function BookingCard({ tourName, priceFromIdr, locale, text, priceText, fleet, site, initialDate = "" }: BookingCardProps) {
  const [date, setDate] = useState(initialDate);
  const [vehicle, setVehicle] = useState(fleet[0]?.id ?? "");
  const dateId = useId();
  const vehicleLabelId = useId();

  const vehicleName = fleet.find((car) => car.id === vehicle)?.name ?? "";
  const message = [
    fill(text.messageIntro, { tour: tourName }),
    fill(text.messageDate, { date: date || text.messageDateUnknown }),
    fill(text.messageVehicle, { vehicle: vehicleName }),
    ...(priceFromIdr === null ? [] : [fill(text.messagePrice, { price: formatIdr(priceFromIdr, locale) })]),
  ].join("\n");

  return (
    <div>
      <p className="display text-[clamp(1.9rem,3vw,2.4rem)] leading-[1.1]">
        {priceFromIdr === null ? priceText.onRequest : fill(priceText.fromPrice, { price: formatIdr(priceFromIdr, locale) })}
      </p>
      {priceFromIdr === null ? null : (
        <p className="mt-1 text-[0.95rem] text-ink-muted">≈ {formatApproxUsd(priceFromIdr, locale, site.idrPerUsd)}</p>
      )}

      <div className="mt-6 grid gap-3">
        <div className="relative rounded-2xl bg-cream px-4 py-2.5 hover:bg-sand focus-within:ring-2 focus-within:ring-jade/35">
          <label htmlFor={dateId} className="label block text-[0.78rem] text-ink-muted">
            {text.date}
          </label>
          <input
            id={dateId}
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-0.5 w-full bg-transparent font-medium outline-none"
          />
        </div>
        <div className="relative rounded-2xl bg-cream px-4 py-2.5 hover:bg-sand focus-within:ring-2 focus-within:ring-jade/35">
          <span id={vehicleLabelId} className="label block text-[0.78rem] text-ink-muted">
            {text.vehicle}
          </span>
          <div className="mt-1">
            <Dropdown
              labelledBy={vehicleLabelId}
              value={vehicle}
              onChange={setVehicle}
              options={fleet.map((car) => ({ value: car.id, label: `${car.name} · ${fill(text.seats, { seats: car.seats })}` }))}
            />
          </div>
        </div>
      </div>

      <a href={whatsappLink(site, message)} className="pill mt-6 w-full bg-jade py-4 text-white hover:bg-jade/90">
        <WhatsappIcon className="size-4 shrink-0" />
        {text.request}
      </a>
      <p className="mt-3 text-center text-[0.9rem] text-ink-muted">{text.note}</p>
    </div>
  );
}
