// The shape of everything the client edits in the admin panel, as stored in Supabase.
// Kept free of runtime imports so the seed script can load it with plain Node.
import type { Locale } from "@/i18n/config";

export const tourLengths = ["day-trip", "multi-day"] as const;
export type TourLength = (typeof tourLengths)[number];

export const tourInterests = ["temples", "culture", "nature", "adventure"] as const;
export type TourInterest = (typeof tourInterests)[number];

/** The two ways to book a package: the car and driver alone, or with the hotel arranged too. */
export const tourStays = ["transport", "accommodation"] as const;
export type TourStay = (typeof tourStays)[number];

export const placeKinds = ["airport", "city", "around", "java", "sight"] as const;
export type PlaceKind = (typeof placeKinds)[number];

/** English is required; Indonesian and French fall back to English when left empty. */
export type Translations<T> = { en: T } & Partial<Record<Exclude<Locale, "en">, T>>;

export type PhotoCredit = {
  subject: string;
  author: string;
  license: string;
  source: string;
};

export type TourText = {
  name: string;
  summary: string;
  /** e.g. "Day trip, there and back" or "2 days, 1 night". */
  duration: string;
  destinations: string[];
  /** Where the guest can be dropped at the end, e.g. "Juanda Airport, Surabaya"; the first is the usual one. Empty means back in Jogja. */
  dropOffs: string[];
  /**
   * Smaller versions of the package a guest can book instead, e.g. "Borobudur only" for "Borobudur & Prambanan".
   * Same order in every language; each has its price at the same position in TourRecord.partPrices. Empty: not split.
   */
  parts: string[];
  photoAlt: string;
};

export type TourRecord = {
  slug: string;
  /** The client's own package letter, e.g. "A". */
  code: string;
  length: TourLength;
  interests: TourInterest[];
  /** Cheapest price for the whole vehicle with driver, fuel and parking, in rupiah; null when quoted on request. */
  priceFromIdr: number | null;
  /** Whether the package is also sold with the hotel arranged. */
  accommodationOffered: boolean;
  /** Cheapest price with the hotel included, in rupiah; null when quoted on request. */
  accommodationPriceFromIdr: number | null;
  /** Transport-only price of each part in text.<locale>.parts, for the cheapest car; null when quoted on request. */
  partPrices: (number | null)[];
  /** A Supabase Storage key ("tours/abc.webp"), or a path under /public for the bundled photos ("/photos/borobudur.jpg"). */
  photo: string | null;
  photoCredit: PhotoCredit | null;
  text: Translations<TourText>;
  published: boolean;
};

/** Per-car transfer fare: a fixed start, a rate per kilometre, and a floor for short trips. */
export type FareRate = {
  baseIdr: number;
  perKmIdr: number;
  minimumIdr: number;
};

export type VehicleRecord = {
  id: string;
  name: string;
  /** Seats as listed by the client, e.g. "7" or "10–12". */
  seats: string;
  /** Most adults and children without big luggage. Babies on a lap don't count. */
  maxPassengers: number;
  /** Most adults and children when they bring suitcases or large bags. */
  maxPassengersWithLuggage: number;
  /** A package's price in this car, as a percentage of its price in the cheapest car (100). */
  tourPricePercent: number;
  dayWithDriverIdr: number;
  dayWithDriverAndFuelIdr: number;
  /** Null when the car isn't offered for transfers. */
  transferRate: FareRate | null;
  published: boolean;
};

export type PlaceRecord = {
  id: string;
  kind: PlaceKind;
  lat: number;
  lng: number;
  name: Translations<string>;
  published: boolean;
};

export type RouteRecord = {
  from: string;
  to: string;
};

export type ReviewRecord = {
  id: string;
  guestName: string;
  origin: Translations<string>;
  quote: Translations<string>;
  /** Slug of the package the guest took, if any. */
  tourSlug: string | null;
  published: boolean;
};

export type FaqRecord = {
  id: string;
  question: Translations<string>;
  answer: Translations<string>;
  published: boolean;
};

export type SiteSettings = {
  businessName: string;
  siteUrl: string;
  whatsappNumber: string;
  phoneDisplay: string;
  email: string;
  address: string;
  googleRating: string;
  googleReviewsUrl: string;
  instagramUrl: string;
  /** Display-only conversion for foreign guests. */
  idrPerUsd: number;
};

/** Saved edits to the page text in src/i18n/dictionaries, keyed by dotted path ("hero.title", "plan.facts.0.label"). */
export type TextOverrides = Record<string, string>;

export type SiteContent = {
  settings: SiteSettings;
  tours: TourRecord[];
  vehicles: VehicleRecord[];
  places: PlaceRecord[];
  routes: RouteRecord[];
  reviews: ReviewRecord[];
  faqs: FaqRecord[];
};
