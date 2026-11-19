// Client-safe types and helpers for tour packages. The data comes from getTours() in @/lib/content/public.
import { localePath, type Locale } from "@/i18n/config";
import type { PhotoCredit, TourInterest, TourLength, TourStay, TourText } from "@/lib/content/schema";

export { tourInterests, tourLengths, tourStays } from "@/lib/content/schema";
export type { TourInterest, TourLength, TourStay, TourText };

/** A published package in one language. Packages are edited in /admin/tours. */
export type Tour = TourText & {
  slug: string;
  code: string;
  length: TourLength;
  interests: TourInterest[];
  /** Cheapest price for the whole vehicle with driver, fuel and parking, in rupiah; null when quoted on request. */
  priceFromIdr: number | null;
  /** Whether the package is also sold with the hotel arranged. */
  accommodationOffered: boolean;
  /** Cheapest price with the hotel included, in rupiah; null when quoted on request. */
  accommodationPriceFromIdr: number | null;
  /** Transport-only price of each of `parts`, for the cheapest car; null when quoted on request. */
  partPrices: (number | null)[];
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

export type TourPart = { name: string; priceFromIdr: number | null };

/** The smaller versions of a package a guest can book instead, with their prices. Empty when it isn't split. */
export function tourParts(tour: Pick<Tour, "parts" | "partPrices">): TourPart[] {
  return tour.parts.map((name, index) => ({ name, priceFromIdr: tour.partPrices[index] ?? null }));
}
