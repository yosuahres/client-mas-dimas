"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";

import { Dropdown } from "@/components/dropdown";
import { WhatsappIcon } from "@/components/icons";
import { DatePicker } from "@/components/pickers/date-picker";
import { PartyPicker } from "@/components/pickers/party-picker";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { fill } from "@/i18n/format";
import { seatOptions, type SeatClass, type Vehicle } from "@/lib/fleet";
import { formatApproxUsd, formatIdr } from "@/lib/money";
import { defaultParty, describeParty, parseParty, type Party } from "@/lib/party";
import { tourPriceInVehicle } from "@/lib/pricing";
import { whatsappLink, type SiteSettings } from "@/lib/site";
import { isTourStay, tourStays, type TourPart, type TourStay } from "@/lib/tours";

type BookingCardProps = {
  tourName: string;
  /** Transport-only price for the cheapest car; null when quoted on request. */
  priceFromIdr: number | null;
  /** Parts of the package a guest can book on their own instead, e.g. "Borobudur only"; empty when it isn't split. */
  parts: TourPart[];
  /** Price with the hotel included, or undefined when the package isn't sold that way; null when quoted on request. */
  accommodationPriceFromIdr?: number | null;
  /** Where the guest can be dropped; the first is preselected. The picker shows only when there's a choice. */
  dropOffs: string[];
  locale: Locale;
  text: Dictionary["bookingCard"];
  pickerText: Dictionary["pickers"];
  stayText: Dictionary["catalog"]["stays"];
  priceText: Pick<Dictionary["tourPage"], "fromPrice" | "fromPriceAccommodation" | "onRequest">;
  /** The cars, in the order set in the admin panel. Only those the group fits in are offered; the cheapest is preselected. */
  fleet: Pick<Vehicle, "id" | "name" | "seatClass" | "seats" | "maxPassengers" | "maxPassengersWithLuggage" | "tourPricePercent">[];
  seatClassText: Dictionary["transfer"]["seatClasses"];
  site: Pick<SiteSettings, "whatsappNumber" | "idrPerUsd">;
  initialDate?: string;
  initialStay?: TourStay;
  initialParty?: Party;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The booking card, starting from the date and passengers picked in the site search (?date=YYYY-MM-DD&adults=2…)
 * and the package type picked on the Tours page (?stay=accommodation). Render inside Suspense.
 */
export function BookingCardFromSearch(props: Omit<BookingCardProps, "initialDate" | "initialStay" | "initialParty">) {
  const params = useSearchParams();
  const date = params.get("date");
  const stay = params.get("stay");
  return (
    <BookingCard
      {...props}
      initialDate={date && DATE_PATTERN.test(date) ? date : undefined}
      initialStay={isTourStay(stay) ? stay : undefined}
      initialParty={parseParty((key) => params.get(key))}
    />
  );
}

// Until online checkout exists, the request goes out as a WhatsApp message and the client replies with the final price.
export function BookingCard({
  tourName,
  priceFromIdr,
  parts,
  accommodationPriceFromIdr,
  dropOffs,
  locale,
  text,
  pickerText,
  stayText,
  priceText,
  fleet,
  seatClassText,
  site,
  initialDate = "",
  initialStay = "transport",
  initialParty = defaultParty,
}: BookingCardProps) {
  const offersAccommodation = accommodationPriceFromIdr !== undefined;
  const [stay, setStay] = useState<TourStay>(offersAccommodation ? initialStay : "transport");
  // -1: the whole package; otherwise the index of the part
  const [partIndex, setPartIndex] = useState(-1);
  const [date, setDate] = useState(initialDate);
  const [party, setParty] = useState(initialParty);
  // The guest's own pick; ignored once their group no longer fits in it
  const [pickedClass, setPickedClass] = useState<SeatClass | null>(null);
  const [dropOff, setDropOff] = useState(dropOffs[0] ?? "");
  const dateLabelId = useId();
  const partyLabelId = useId();
  const vehicleLabelId = useId();
  const dropOffLabelId = useId();
  const visitLabelId = useId();

  const withHotel = stay === "accommodation";
  // Parts are sold as transport only; with the hotel, it's the whole package
  const part = !withHotel && partIndex >= 0 ? parts[partIndex] : undefined;
  // The smallest seat group the party fits in and the next one up, each priced at its cheapest car
  const carOptions = seatOptions(fleet, party, (car) => car.tourPricePercent);
  const carOption = carOptions.find((option) => option.seatClass === pickedClass) ?? carOptions[0];
  const vehicle = carOption?.vehicle;
  const carLabel = carOption ? seatClassText[carOption.seatClass] : "";
  const carNames = carOption ? carOption.vehicles.map((car) => car.name).join(" / ") : "";

  const basePrice = withHotel ? (accommodationPriceFromIdr ?? null) : part ? part.priceFromIdr : priceFromIdr;
  // The hotel price is quoted as a whole; the transport price follows the car
  const price = basePrice === null || !vehicle ? null : withHotel ? basePrice : tourPriceInVehicle(basePrice, vehicle);
  const formattedPrice = price === null ? null : formatIdr(price, locale);
  const partyText = describeParty(party, pickerText.party, locale) + (party.luggage ? `, ${pickerText.party.withLuggage}` : "");
  const message = [
    fill(text.messageIntro, { tour: tourName }),
    ...(offersAccommodation ? [fill(text.messageStay, { stay: stayText[stay] })] : []),
    ...(part ? [fill(text.messagePart, { part: part.name })] : []),
    fill(text.messageDate, { date: date || text.messageDateUnknown }),
    fill(pickerText.party.messagePassengers, { party: describeParty(party, pickerText.party, locale) }),
    party.luggage ? pickerText.party.messageLuggage : pickerText.party.messageNoLuggage,
    carOption ? fill(text.messageVehicle, { vehicle: `${carLabel} (${carNames})` }) : text.messageTooBig,
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
                stay === value ? "bg-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              {stayText[value]}
            </button>
          ))}
        </div>
      ) : null}

      {parts.length > 0 && !withHotel ? (
        <div className="mb-6">
          <p id={visitLabelId} className="label text-[0.78rem] text-ink-muted">
            {text.visit}
          </p>
          <div role="radiogroup" aria-labelledby={visitLabelId} className="mt-2 grid grid-cols-1 gap-2">
            {[{ name: text.wholePackage, priceFromIdr }, ...parts].map((option, index) => {
              const value = index - 1;
              const optionPrice = option.priceFromIdr === null || !vehicle ? null : tourPriceInVehicle(option.priceFromIdr, vehicle);
              return (
                <button
                  key={option.name}
                  type="button"
                  role="radio"
                  aria-checked={partIndex === value}
                  onClick={() => setPartIndex(value)}
                  className="flex items-center gap-3 rounded-xl border border-ink/12 px-4 py-3 text-left hover:bg-cream aria-checked:border-jade aria-checked:bg-jade/5"
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${partIndex === value ? "border-jade" : "border-ink/25"}`}
                  >
                    {partIndex === value ? <span className="size-2.5 rounded-full bg-jade" /> : null}
                  </span>
                  <span className="min-w-0 flex-1 font-medium">{option.name}</span>
                  <span className="shrink-0 text-[0.92rem] text-ink-muted tabular-nums">
                    {optionPrice === null ? priceText.onRequest : formatIdr(optionPrice, locale)}
                  </span>
                </button>
              );
            })}
          </div>
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
      {!withHotel && vehicle ? (
        <p className="mt-2 text-[0.95rem] text-ink-muted">{fill(text.carNote, { party: partyText, vehicle: carLabel })}</p>
      ) : null}
      {vehicle ? null : <p className="mt-2 text-[0.95rem] font-medium text-clay">{text.tooBig}</p>}

      <div className="mt-6 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="@container relative min-w-0 rounded-2xl bg-cream px-4 py-2.5 hover:bg-sand focus-within:ring-2 focus-within:ring-jade/35">
            <span id={dateLabelId} className="label block text-[0.78rem] text-ink-muted">
              {text.date}
            </span>
            <div className="mt-1">
              <DatePicker labelledBy={dateLabelId} value={date} onChange={setDate} locale={locale} text={pickerText} />
            </div>
          </div>
          <div className="@container relative min-w-0 rounded-2xl bg-cream px-4 py-2.5 hover:bg-sand focus-within:ring-2 focus-within:ring-jade/35">
            <span id={partyLabelId} className="label block text-[0.78rem] text-ink-muted">
              {pickerText.party.title}
            </span>
            <div className="mt-1">
              <PartyPicker labelledBy={partyLabelId} value={party} onChange={setParty} locale={locale} text={pickerText} />
            </div>
          </div>
        </div>
        {carOptions.length > 0 ? (
          <div>
            <p id={vehicleLabelId} className="label text-[0.78rem] text-ink-muted">
              {text.vehicle}
            </p>
            <div role="radiogroup" aria-labelledby={vehicleLabelId} className="mt-2 grid grid-cols-1 gap-2">
              {carOptions.map((option, index) => {
                const checked = option.seatClass === carOption?.seatClass;
                const optionPrice = basePrice === null ? null : withHotel ? null : tourPriceInVehicle(basePrice, option.vehicle);
                return (
                  <button
                    key={option.seatClass}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => setPickedClass(option.seatClass)}
                    className="flex items-center gap-3 rounded-xl border border-ink/12 px-4 py-3 text-left hover:bg-cream aria-checked:border-jade aria-checked:bg-jade/5"
                  >
                    <span
                      aria-hidden="true"
                      className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${checked ? "border-jade" : "border-ink/25"}`}
                    >
                      {checked ? <span className="size-2.5 rounded-full bg-jade" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">
                        {seatClassText[option.seatClass]}
                        {index === 0 ? <span className="ml-2 text-[0.85rem] font-medium text-jade">{text.recommended}</span> : null}
                      </span>
                      <span className="block truncate text-[0.88rem] text-ink-muted">
                        {option.vehicles.map((car) => car.name).join(" / ")}
                      </span>
                    </span>
                    {optionPrice === null ? null : (
                      <span className="shrink-0 text-[0.92rem] text-ink-muted tabular-nums">{formatIdr(optionPrice, locale)}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
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
