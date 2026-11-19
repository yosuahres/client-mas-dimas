import "server-only";

// What the public pages read: published content in the visitor's language.
// Server-only; the client-safe types and helpers are in @/lib/tours, @/lib/transfers, @/lib/fleet and @/lib/site.
import type { Locale } from "@/i18n/config";
import {
  loadFaqs,
  loadPlaces,
  loadReviews,
  loadRoutes,
  loadSettings,
  loadTours,
  loadVehicles,
} from "@/lib/content/store";
import type { SiteSettings, TourRecord } from "@/lib/content/schema";
import { translate, translateFields } from "@/lib/content/translate";
import type { Vehicle } from "@/lib/fleet";
import { photoUrl } from "@/lib/photos";
import type { Tour } from "@/lib/tours";
import type { Place, PopularRoute, TransferVehicle } from "@/lib/transfers";

export async function getSite(): Promise<SiteSettings> {
  return loadSettings();
}

function localizeTour(record: TourRecord, locale: Locale): Tour {
  return {
    ...translateFields(record.text, locale),
    slug: record.slug,
    code: record.code,
    length: record.length,
    interests: record.interests,
    priceFromIdr: record.priceFromIdr,
    accommodationOffered: record.accommodationOffered,
    accommodationPriceFromIdr: record.accommodationPriceFromIdr,
    partPrices: record.partPrices,
    photo: photoUrl(record.photo),
    photoCredit: record.photoCredit,
  };
}

/** Published packages, in the order set in the admin panel. */
export async function getTours(locale: Locale): Promise<Tour[]> {
  return (await loadTours()).map((record) => localizeTour(record, locale));
}

export async function getTour(locale: Locale, slug: string): Promise<Tour | undefined> {
  const record = (await loadTours()).find((tour) => tour.slug === slug);
  return record ? localizeTour(record, locale) : undefined;
}

/** Published cars, in the order set in the admin panel. */
export async function getFleet(): Promise<Vehicle[]> {
  return (await loadVehicles()).map(
    ({ id, name, seats, maxPassengers, maxPassengersWithLuggage, tourPricePercent, dayWithDriverIdr, dayWithDriverAndFuelIdr, transferRate }) => ({
      id,
      name,
      seats,
      maxPassengers,
      maxPassengersWithLuggage,
      tourPricePercent,
      dayWithDriverIdr,
      dayWithDriverAndFuelIdr,
      transferRate,
    }),
  );
}

/** Cars offered for transfers, with their per-car rate and how many people they take. */
export async function getTransferVehicles(): Promise<TransferVehicle[]> {
  return (await loadVehicles()).flatMap(({ id, name, seats, maxPassengers, maxPassengersWithLuggage, transferRate }) =>
    transferRate ? [{ id, name, seats, maxPassengers, maxPassengersWithLuggage, rate: transferRate }] : [],
  );
}

/** Published places with their names in this language, in the order set in the admin panel. */
export async function getPlaces(locale: Locale): Promise<Place[]> {
  return (await loadPlaces()).map(({ id, kind, lat, lng, name }) => ({ id, kind, lat, lng, name: translate(name, locale) }));
}

/** Popular routes whose both ends are published. */
export async function getPopularRoutes(): Promise<PopularRoute[]> {
  const [routes, places] = await Promise.all([loadRoutes(), loadPlaces()]);
  const published = new Set(places.map((place) => place.id));
  return routes.filter((route) => published.has(route.from) && published.has(route.to));
}

export type Review = {
  id: string;
  guestName: string;
  origin: string;
  quote: string;
  /** Name of the package the guest took, in this language. */
  tourName: string | null;
};

export async function getReviews(locale: Locale): Promise<Review[]> {
  const [reviews, tours] = await Promise.all([loadReviews(), loadTours()]);
  return reviews.map((review) => {
    const tour = tours.find((candidate) => candidate.slug === review.tourSlug);
    return {
      id: review.id,
      guestName: review.guestName,
      origin: translate(review.origin, locale),
      quote: translate(review.quote, locale),
      tourName: tour ? translateFields(tour.text, locale).name : null,
    };
  });
}

export type Faq = {
  id: string;
  question: string;
  answer: string;
};

export async function getFaqs(locale: Locale): Promise<Faq[]> {
  return (await loadFaqs()).map((faq) => ({
    id: faq.id,
    question: translate(faq.question, locale),
    answer: translate(faq.answer, locale),
  }));
}
