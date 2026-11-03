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
import type { PhotoCredit, SiteSettings, TourRecord } from "@/lib/content/schema";
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
  return (await loadVehicles()).map(({ id, name, seats, maxPassengers, dayWithDriverIdr, dayWithDriverAndFuelIdr, transferRate }) => ({
    id,
    name,
    seats,
    maxPassengers,
    dayWithDriverIdr,
    dayWithDriverAndFuelIdr,
    transferRate,
  }));
}

/** Cars offered for transfers, with their per-car rate. */
export async function getTransferVehicles(): Promise<TransferVehicle[]> {
  return (await loadVehicles()).flatMap(({ id, name, seats, transferRate }) =>
    transferRate ? [{ id, name, seats, rate: transferRate }] : [],
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

// Fixed section photos in src/assets; package photos carry their own credit, set in /admin/tours.
const sectionPhotoCredits: PhotoCredit[] = [
  {
    subject: "Prambanan",
    author: "CEphoto, Uwe Aranas",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Yogyakarta_Indonesia_Prambanan-temple-complex-23.jpg",
  },
  {
    subject: "Kraton",
    author: "Jorge Franganillo",
    license: "CC BY 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Kraton_Ngayogyakarta_Hadiningrat_(49797461187).jpg",
  },
  {
    subject: "Jomblang cave",
    author: "Arie Basuki",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Cahaya_Goa_Jomblang.jpg",
  },
  {
    subject: "Merapi",
    author: "Kang Henry Irawan",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Gagahnya_Merapi.jpg",
  },
  {
    subject: "Batik in Imogiri",
    author: "Aconkyeah",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Maestro_Batik_Tulis_di_Imogiri.jpg",
  },
];

/** Every credit the site must show (CC BY / BY-SA): section photos, then each published package photo, without repeats. */
export async function getPhotoCredits(): Promise<PhotoCredit[]> {
  const tourCredits = (await loadTours()).flatMap((tour) => (tour.photoCredit ? [tour.photoCredit] : []));
  const bySource = new Map([...sectionPhotoCredits, ...tourCredits].map((credit) => [credit.source, credit]));
  return [...bySource.values()];
}
