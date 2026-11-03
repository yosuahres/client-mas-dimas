// Client-safe types and helpers for tour packages. The data comes from getTours() in @/lib/content/public.
import { localePath, type Locale } from "@/i18n/config";
import type { PhotoCredit, TourInterest, TourLength, TourText } from "@/lib/content/schema";

export { tourInterests, tourLengths } from "@/lib/content/schema";
export type { TourInterest, TourLength, TourText };

/** A published package in one language. Packages are edited in /admin/tours. */
export type Tour = TourText & {
  slug: string;
  code: string;
  length: TourLength;
  interests: TourInterest[];
  /** Cheapest price for the whole vehicle with driver, fuel and parking, in rupiah; null when quoted on request. */
  priceFromIdr: number | null;
  /** Full URL or /public path; null when no photo has been added yet. */
  photo: string | null;
  photoCredit: PhotoCredit | null;
};

export function tourHref(locale: Locale, tour: Pick<Tour, "slug">) {
  return localePath(locale, `/tours/${tour.slug}`);
}

/** Sort key for "lowest price": packages quoted on request go last. */
export function priceSortKey(tour: Pick<Tour, "priceFromIdr">) {
  return tour.priceFromIdr ?? Number.POSITIVE_INFINITY;
}
