import "server-only";

// What the public pages read: published content in the visitor's language.
// Server-only; the client-safe types and helpers are in @/lib/tours, @/lib/transfers, @/lib/fleet and @/lib/site.
import type { Locale } from "@/i18n/config";
import {
  loadArticles,
  loadFaqs,
  loadGallery,
  loadHomePhotos,
  loadPlaces,
  loadReviews,
  loadRoutes,
  loadSettings,
  loadTours,
  loadVehicles,
} from "@/lib/content/store";
import type { HomePhotoSlot, SiteSettings, TourRecord, VehicleRecord } from "@/lib/content/schema";
import { translate, translateFields } from "@/lib/content/translate";
import type { Vehicle } from "@/lib/fleet";
import { photoUrl } from "@/lib/photos";
import { cheapestCarPrice } from "@/lib/pricing";
import type { Tour } from "@/lib/tours";
import type { Place, PopularRoute, TransferVehicle } from "@/lib/transfers";

export async function getSite(): Promise<SiteSettings> {
  return loadSettings();
}

/** The URL of each home page photo the client replaced. A missing slot keeps the built-in photo. */
export async function getHomePhotos(): Promise<Partial<Record<HomePhotoSlot, string>>> {
  const photos = await loadHomePhotos();
  return Object.fromEntries(Object.entries(photos).flatMap(([slot, photo]) => {
    const url = photoUrl(photo);
    return url ? [[slot, url]] : [];
  }));
}

function localizeTour(record: TourRecord, locale: Locale, fleet: VehicleRecord[]): Tour {
  return {
    ...translateFields(record.text, locale),
    slug: record.slug,
    code: record.code,
    length: record.length,
    interests: record.interests,
    priceFromIdr: cheapestCarPrice(record.carPrices, fleet),
    carPrices: record.carPrices,
    accommodationOffered: record.accommodationOffered,
    accommodationPriceFromIdr: record.accommodationPriceFromIdr,
    partPrices: record.partPrices,
    photo: photoUrl(record.photo),
    photoCredit: record.photoCredit,
  };
}

/** Published packages, in the order set in the admin panel. */
export async function getTours(locale: Locale): Promise<Tour[]> {
  const [tours, fleet] = await Promise.all([loadTours(), loadVehicles()]);
  return tours.map((record) => localizeTour(record, locale, fleet));
}

export async function getTour(locale: Locale, slug: string): Promise<Tour | undefined> {
  const [tours, fleet] = await Promise.all([loadTours(), loadVehicles()]);
  const record = tours.find((tour) => tour.slug === slug);
  return record ? localizeTour(record, locale, fleet) : undefined;
}

/** Published cars, in the order set in the admin panel. */
export async function getFleet(): Promise<Vehicle[]> {
  return (await loadVehicles()).map(
    ({ id, name, seatClass, seats, maxPassengers, maxPassengersWithLuggage }) => ({
      id,
      name,
      seatClass,
      seats,
      maxPassengers,
      maxPassengersWithLuggage,
    }),
  );
}

/** The cars on the website, for transfers: how many people they take. Their prices are on the routes. */
export async function getTransferVehicles(): Promise<TransferVehicle[]> {
  return (await loadVehicles()).map(({ id, name, seatClass, seats, maxPassengers, maxPassengersWithLuggage }) => ({
    id,
    name,
    seatClass,
    seats,
    maxPassengers,
    maxPassengersWithLuggage,
  }));
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

export type GalleryPhoto = {
  id: string;
  url: string;
  /** Empty when the photo has no caption. */
  caption: string;
};

export async function getGallery(locale: Locale): Promise<GalleryPhoto[]> {
  return (await loadGallery()).flatMap((item) => {
    const url = photoUrl(item.photo);
    return url ? [{ id: item.id, url, caption: translate(item.caption, locale) }] : [];
  });
}

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover: string | null;
  photos: string[];
  /** "2026-11-27" */
  publishedOn: string;
  /** A sample shown before the first real article: not for search engines. */
  sample: boolean;
};

/** Published articles in this language, newest first. */
export async function getArticles(locale: Locale): Promise<Article[]> {
  return (await loadArticles()).map((record) => ({
    ...translateFields(record.text, locale),
    slug: record.slug,
    cover: photoUrl(record.cover),
    photos: record.photos.flatMap((photo) => photoUrl(photo) ?? []),
    publishedOn: record.publishedOn,
    sample: record.sample === true,
  }));
}

export async function getArticle(locale: Locale, slug: string): Promise<Article | undefined> {
  return (await getArticles(locale)).find((article) => article.slug === slug);
}
