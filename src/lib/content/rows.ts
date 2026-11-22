// Converts between Supabase rows (snake_case) and the content records in ./schema.
import { defaultContent } from "@/lib/content/defaults";
import type {
  FaqRecord,
  HomePhotos,
  HomePhotoSlot,
  PlaceRecord,
  ReviewRecord,
  RouteRecord,
  SiteSettings,
  TourRecord,
  VehicleRecord,
} from "@/lib/content/schema";

export const tables = {
  settings: "site_settings",
  tours: "tours",
  vehicles: "vehicles",
  places: "places",
  routes: "popular_routes",
  reviews: "reviews",
  faqs: "faqs",
  text: "page_text",
  homePhotos: "home_photos",
} as const;

export type SettingsRow = {
  business_name: string;
  site_url: string;
  whatsapp_number: string;
  phone_display: string;
  email: string;
  address: string;
  google_rating: string;
  google_reviews_url: string;
  instagram_url: string;
  idr_per_usd: number;
};

export function settingsFromRow(row: SettingsRow): SiteSettings {
  return {
    businessName: row.business_name,
    siteUrl: row.site_url,
    whatsappNumber: row.whatsapp_number,
    phoneDisplay: row.phone_display,
    email: row.email,
    address: row.address,
    googleRating: row.google_rating,
    googleReviewsUrl: row.google_reviews_url,
    instagramUrl: row.instagram_url,
    idrPerUsd: row.idr_per_usd,
  };
}

export function settingsToRow(settings: SiteSettings): SettingsRow & { id: 1 } {
  return {
    id: 1,
    business_name: settings.businessName,
    site_url: settings.siteUrl,
    whatsapp_number: settings.whatsappNumber,
    phone_display: settings.phoneDisplay,
    email: settings.email,
    address: settings.address,
    google_rating: settings.googleRating,
    google_reviews_url: settings.googleReviewsUrl,
    instagram_url: settings.instagramUrl,
    idr_per_usd: settings.idrPerUsd,
  };
}

export type TourRow = {
  slug: string;
  code: string;
  length: TourRecord["length"];
  interests: TourRecord["interests"];
  price_from_idr: number | null;
  accommodation_offered: boolean;
  accommodation_price_from_idr: number | null;
  part_prices: TourRecord["partPrices"] | null;
  photo: string | null;
  photo_credit: TourRecord["photoCredit"];
  text: TourRecord["text"];
  position: number;
  published: boolean;
};

export function tourFromRow(row: TourRow): TourRecord {
  return {
    slug: row.slug,
    code: row.code,
    length: row.length,
    interests: row.interests,
    priceFromIdr: row.price_from_idr,
    // Defaults cover a database that hasn't had the 20261108 migration yet.
    accommodationOffered: row.accommodation_offered ?? true,
    accommodationPriceFromIdr: row.accommodation_price_from_idr ?? null,
    partPrices: row.part_prices ?? builtInTour(row.slug)?.partPrices ?? [],
    photo: row.photo,
    photoCredit: row.photo_credit,
    text: withBuiltInParts(withDropOffs(row.text), row),
    published: row.published,
  };
}

// Until the 20261120 migration has run, the database has no split options or car capacities (the columns come
// back undefined). Meanwhile the site shows the built-in dummies for the packages and cars it launched with.
const builtInTour = (slug: string) => defaultContent.tours.find((tour) => tour.slug === slug);
const builtInVehicle = (id: string) => defaultContent.vehicles.find((vehicle) => vehicle.id === id);

function withBuiltInParts(text: TourRecord["text"], row: TourRow): TourRecord["text"] {
  const builtIn = builtInTour(row.slug);
  if (row.part_prices !== undefined || !builtIn) return text;
  return Object.fromEntries(
    Object.entries(text).map(([locale, fields]) => [
      locale,
      fields && { ...fields, parts: builtIn.text[locale as keyof TourRecord["text"]]?.parts ?? builtIn.text.en.parts },
    ]),
  ) as TourRecord["text"];
}

/** Packages saved before drop-off points or parts existed have none in their text. */
function withDropOffs(text: TourRecord["text"]): TourRecord["text"] {
  return Object.fromEntries(
    Object.entries(text).map(([locale, fields]) => [
      locale,
      fields && { ...fields, dropOffs: fields.dropOffs ?? [], parts: fields.parts ?? [] },
    ]),
  ) as TourRecord["text"];
}

export function tourToRow(tour: TourRecord): Omit<TourRow, "position"> {
  return {
    slug: tour.slug,
    code: tour.code,
    length: tour.length,
    interests: tour.interests,
    price_from_idr: tour.priceFromIdr,
    accommodation_offered: tour.accommodationOffered,
    accommodation_price_from_idr: tour.accommodationPriceFromIdr,
    part_prices: tour.partPrices,
    photo: tour.photo,
    photo_credit: tour.photoCredit,
    text: tour.text,
    published: tour.published,
  };
}

export type VehicleRow = {
  id: string;
  name: string;
  seat_class: VehicleRecord["seatClass"] | null;
  seats: string;
  max_passengers: number;
  max_passengers_with_luggage: number | null;
  tour_price_percent: number | null;
  day_with_driver_idr: number;
  day_with_driver_and_fuel_idr: number;
  transfer_base_idr: number | null;
  transfer_per_km_idr: number | null;
  transfer_minimum_idr: number | null;
  position: number;
  published: boolean;
};

export function vehicleFromRow(row: VehicleRow): VehicleRecord {
  const offersTransfers =
    row.transfer_base_idr !== null && row.transfer_per_km_idr !== null && row.transfer_minimum_idr !== null;
  return {
    id: row.id,
    name: row.name,
    // Until the 20261120010000 migration has run: the built-in group, or one guessed from the seats
    seatClass: row.seat_class ?? builtInVehicle(row.id)?.seatClass ?? (row.max_passengers > 7 ? "large" : "seven"),
    seats: row.seats,
    maxPassengers: row.max_passengers,
    maxPassengersWithLuggage:
      row.max_passengers_with_luggage ?? Math.min(builtInVehicle(row.id)?.maxPassengersWithLuggage ?? row.max_passengers, row.max_passengers),
    tourPricePercent: row.tour_price_percent ?? builtInVehicle(row.id)?.tourPricePercent ?? 100,
    dayWithDriverIdr: row.day_with_driver_idr,
    dayWithDriverAndFuelIdr: row.day_with_driver_and_fuel_idr,
    transferRate: offersTransfers
      ? { baseIdr: row.transfer_base_idr!, perKmIdr: row.transfer_per_km_idr!, minimumIdr: row.transfer_minimum_idr! }
      : null,
    published: row.published,
  };
}

export function vehicleToRow(vehicle: VehicleRecord): Omit<VehicleRow, "position"> {
  return {
    id: vehicle.id,
    name: vehicle.name,
    seat_class: vehicle.seatClass,
    seats: vehicle.seats,
    max_passengers: vehicle.maxPassengers,
    max_passengers_with_luggage: vehicle.maxPassengersWithLuggage,
    tour_price_percent: vehicle.tourPricePercent,
    day_with_driver_idr: vehicle.dayWithDriverIdr,
    day_with_driver_and_fuel_idr: vehicle.dayWithDriverAndFuelIdr,
    transfer_base_idr: vehicle.transferRate?.baseIdr ?? null,
    transfer_per_km_idr: vehicle.transferRate?.perKmIdr ?? null,
    transfer_minimum_idr: vehicle.transferRate?.minimumIdr ?? null,
    published: vehicle.published,
  };
}

export type PlaceRow = {
  id: string;
  kind: PlaceRecord["kind"];
  lat: number;
  lng: number;
  name: PlaceRecord["name"];
  position: number;
  published: boolean;
};

export function placeFromRow(row: PlaceRow): PlaceRecord {
  return { id: row.id, kind: row.kind, lat: row.lat, lng: row.lng, name: row.name, published: row.published };
}

export function placeToRow(place: PlaceRecord): Omit<PlaceRow, "position"> {
  return { id: place.id, kind: place.kind, lat: place.lat, lng: place.lng, name: place.name, published: place.published };
}

export type RouteRow = {
  id: string;
  from_place: string;
  to_place: string;
  position: number;
};

export function routeFromRow(row: RouteRow): RouteRecord & { id: string } {
  return { id: row.id, from: row.from_place, to: row.to_place };
}

export type ReviewRow = {
  id: string;
  guest_name: string;
  origin: ReviewRecord["origin"];
  quote: ReviewRecord["quote"];
  tour_slug: string | null;
  position: number;
  published: boolean;
};

export function reviewFromRow(row: ReviewRow): ReviewRecord {
  return {
    id: row.id,
    guestName: row.guest_name,
    origin: row.origin,
    quote: row.quote,
    tourSlug: row.tour_slug,
    published: row.published,
  };
}

export function reviewToRow(review: Omit<ReviewRecord, "id">): Omit<ReviewRow, "id" | "position"> {
  return {
    guest_name: review.guestName,
    origin: review.origin,
    quote: review.quote,
    tour_slug: review.tourSlug,
    published: review.published,
  };
}

export type FaqRow = {
  id: string;
  question: FaqRecord["question"];
  answer: FaqRecord["answer"];
  position: number;
  published: boolean;
};

export function faqFromRow(row: FaqRow): FaqRecord {
  return { id: row.id, question: row.question, answer: row.answer, published: row.published };
}

export function faqToRow(faq: Omit<FaqRecord, "id">): Omit<FaqRow, "id" | "position"> {
  return { question: faq.question, answer: faq.answer, published: faq.published };
}

export type HomePhotoRow = {
  slot: HomePhotoSlot;
  photo: string;
};

export function homePhotosFromRows(rows: HomePhotoRow[]): HomePhotos {
  return Object.fromEntries(rows.map(({ slot, photo }) => [slot, photo]));
}
