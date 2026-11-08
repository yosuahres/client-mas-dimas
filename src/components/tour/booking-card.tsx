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
import { isTourStay, tourStays, type TourStay } from "@/lib/tours";

type BookingCardProps = {
  tourName: string;
  /** Transport-only price; null when quoted on request. */
  priceFromIdr: number | null;
  /** Price with the hotel included, or undefined when the package isn't sold that way; null when quoted on request. */
  accommodationPriceFromIdr?: number | null;
  /** Where the guest can be dropped; the first is preselected. The picker shows only when there's a choice. */
  dropOffs: string[];
  locale: Locale;
  text: Dictionary["bookingCard"];
  stayText: Dictionary["catalog"]["stays"];
  priceText: Pick<Dictionary["tourPage"], "fromPrice" | "fromPriceAccommodation" | "onRequest">;
  /** The cars to choose from, in the order set in the admin panel; the first is preselected. */
  fleet: Pick<Vehicle, "id" | "name" | "seats">[];
  site: Pick<SiteSettings, "whatsappNumber" | "idrPerUsd">;
  initialDate?: string;
  initialStay?: TourStay;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** The booking card, starting from the date picked in the site search (?date=YYYY-MM-DD) and the package type picked on the Tours page (?stay=accommodation). Render inside Suspense. */
export function BookingCardFromSearch(props: Omit<BookingCardProps, "initialDate" | "initialStay">) {
  const params = useSearchParams();
  const date = params.get("date");
  const stay = params.get("stay");
  return (
    <BookingCard
      {...props}
      initialDate={date && DATE_PATTERN.test(date) ? date : undefined}
      initialStay={isTourStay(stay) ? stay : undefined}
    />
  );
}

// Until online checkout exists, the request goes out as a WhatsApp message and the client replies with the final price.
export function BookingCard({
  tourName,
  priceFromIdr,
  accommodationPriceFromIdr,
  dropOffs,
  locale,
  text,
  stayText,
  priceText,
  fleet,
  site,
  initialDate = "",
  initialStay = "transport",
}: BookingCardProps) {
  const offersAccommodation = accommodationPriceFromIdr !== undefined;
  const [stay, setStay] = useState<TourStay>(offersAccommodation ? initialStay : "transport");
  const [date, setDate] = useState(initialDate);
  const [vehicle, setVehicle] = useState(fleet[0]?.id ?? "");
  const [dropOff, setDropOff] = useState(dropOffs[0] ?? "");
  const dateId = useId();
  const vehicleLabelId = useId();
  const dropOffLabelId = useId();

  const withHotel = stay === "accommodation";
  const price = withHotel ? (accommodationPriceFromIdr ?? null) : priceFromIdr;
  const formattedPrice = price === null ? null : formatIdr(price, locale);
  const vehicleName = fleet.find((car) => car.id === vehicle)?.name ?? "";
  const message = [
    fill(text.messageIntro, { tour: tourName }),
    ...(offersAccommodation ? [fill(text.messageStay, { stay: stayText[stay] })] : []),
    fill(text.messageDate, { date: date || text.messageDateUnknown }),
    fill(text.messageVehicle, { vehicle: vehicleName }),
    ...(dropOffs.length > 1 ? [fill(text.messageDropOff, { place: dropOff })] : []),
    ...(formattedPrice === null
      ? []
      : [fill(withHotel ? text.messagePriceAccommodation : text.messagePrice, { price: formattedPrice })]),
  ].join("\n");

  return (
    <div>
      {offersAccommodation ? (
        <div role="radiogroup" aria-label={text.stay} className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-cream p-1">
          {tourStays.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={stay === value}
              onClick={() => setStay(value)}
              className={`rounded-full px-3 py-2 text-[0.92rem] font-medium ${
                stay === value ? "bg-white shadow-[0_4px_14px_-8px_rgb(0_0_0/0.35)]" : "text-ink-muted hover:text-ink"
              }`}
            >
              {stayText[value]}
            </button>
          ))}
        </div>
      ) : null}

      <p className="display text-[clamp(1.9rem,3vw,2.4rem)] leading-[1.1]">
        {formattedPrice === null
          ? priceText.onRequest
          : fill(withHotel ? priceText.fromPriceAccommodation : priceText.fromPrice, { price: formattedPrice })}
      </p>
      {price === null ? null : (
        <p className="mt-1 text-[0.95rem] text-ink-muted">≈ {formatApproxUsd(price, locale, site.idrPerUsd)}</p>
      )}
      {withHotel ? <p className="mt-2 text-[0.95rem] text-ink-muted">{text.accommodationNote}</p> : null}

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
        {dropOffs.length > 1 ? (
          <div className="relative rounded-2xl bg-cream px-4 py-2.5 hover:bg-sand focus-within:ring-2 focus-within:ring-jade/35">
            <span id={dropOffLabelId} className="label block text-[0.78rem] text-ink-muted">
              {text.dropOff}
            </span>
            <div className="mt-1">
              <Dropdown
                labelledBy={dropOffLabelId}
                value={dropOff}
                onChange={setDropOff}
                options={dropOffs.map((place) => ({ value: place, label: place }))}
              />
            </div>
          </div>
        ) : null}
      </div>

      <a href={whatsappLink(site, message)} className="pill mt-6 w-full bg-jade py-4 text-white hover:bg-jade/90">
        <WhatsappIcon className="size-4 shrink-0" />
        {text.request}
      </a>
    </div>
  );
}
