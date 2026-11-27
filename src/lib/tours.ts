// Client-safe types and helpers for tour packages. The data comes from getTours() in @/lib/content/public.
import { localePath, type Locale } from "@/i18n/config";
import type { CarPrices, PhotoCredit, TourInterest, TourLength, TourStay, TourText } from "@/lib/content/schema";

export { tourInterests, tourLengths, tourStays } from "@/lib/content/schema";
export type { TourInterest, TourLength, TourStay, TourText };

/** A published package in one language. Packages are edited in /admin/tours. */
export type Tour = TourText & {
  slug: string;
  code: string;
  length: TourLength;
  interests: TourInterest[];
  /** The lowest of carPrices across the cars on the site, in rupiah; null when every car is on request. */
  priceFromIdr: number | null;
  /** The whole package's price in each car, with driver, fuel and parking, by car id. A car left out: on request. */
  carPrices: CarPrices;
  /** Whether the package is also sold with the hotel arranged. */
  accommodationOffered: boolean;
  /** Cheapest price with the hotel included, in rupiah; null when quoted on request. */
  accommodationPriceFromIdr: number | null;
  /** The per-car prices of each of `parts`, in that order. */
  partPrices: CarPrices[];
  /** Full URL or /public path; null when no photo has been added yet. */
  photo: string | null;
  photoCredit: PhotoCredit | null;
};

/** The package page; `stay` preselects the accommodation option in its booking card. */
export function tourHref(locale: Locale, tour: Pick<Tour, "slug">, stay: TourStay = "transport") {
  const path = localePath(locale, `/tours/${tour.slug}`);
  return stay === "accommodation" ? `${path}?stay=accommodation` : path;
}

export function isTourStay(value: string | null): value is TourStay {
  return value === "transport" || value === "accommodation";
}

/** The package's price for this option, or null when it's quoted on request. */
export function stayPrice(tour: Pick<Tour, "priceFromIdr" | "accommodationPriceFromIdr">, stay: TourStay) {
  return stay === "accommodation" ? tour.accommodationPriceFromIdr : tour.priceFromIdr;
}

/** Sort key for "lowest price": packages quoted on request go last. */
export function priceSortKey(tour: Pick<Tour, "priceFromIdr" | "accommodationPriceFromIdr">, stay: TourStay = "transport") {
  return stayPrice(tour, stay) ?? Number.POSITIVE_INFINITY;
}

export type TourPart = { name: string; carPrices: CarPrices };

/** The smaller versions of a package a guest can book instead, with their per-car prices. Empty when it isn't split. */
export function tourParts(tour: Pick<Tour, "parts" | "partPrices">): TourPart[] {
  return tour.parts.map((name, index) => ({ name, carPrices: tour.partPrices[index] ?? {} }));
}
