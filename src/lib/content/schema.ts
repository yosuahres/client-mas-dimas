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

/**
 * Cars are offered to guests by seat group, not one by one: the smallest group their party fits in, and the
 * next one up. Which car is in which group is set in /admin/fleet.
 */
export const seatClasses = ["five", "seven", "large"] as const;
export type SeatClass = (typeof seatClasses)[number];

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

/** Fixed prices by car id, in rupiah. A car left out is quoted on request. */
export type CarPrices = Record<string, number>;

export type TourRecord = {
  slug: string;
  /** The client's own package letter, e.g. "A". */
  code: string;
  length: TourLength;
  interests: TourInterest[];
  /** Whether the package is also sold with the hotel arranged. */
  accommodationOffered: boolean;
  /** Cheapest price with the hotel included, in rupiah; null when quoted on request. */
  accommodationPriceFromIdr: number | null;
  /**
   * The whole package's price in each car, with driver, fuel and parking, in rupiah, by car id:
   * {"avanza": 550000, "hiace": 1190000}. A car left out is quoted on request ("Hubungi kami").
   */
  carPrices: CarPrices;
  /** The same per-car prices for each part in text.<locale>.parts, in that order. */
  partPrices: CarPrices[];
  /** A Supabase Storage key ("tours/abc.webp"), or a path under /public for the bundled photos ("/photos/borobudur.jpg"). */
  photo: string | null;
  photoCredit: PhotoCredit | null;
  text: Translations<TourText>;
  published: boolean;
};

export type VehicleRecord = {
  id: string;
  name: string;
  /** 5 seater, 7 seater or above 7. */
  seatClass: SeatClass;
  /** Seats as listed by the client, e.g. "7" or "10–12". */
  seats: string;
  /** Most adults and children without big luggage. Babies on a lap don't count. */
  maxPassengers: number;
  /** Most adults and children when they bring suitcases or large bags. */
  maxPassengersWithLuggage: number;
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

/** A transfer route with its fixed price per car. The prices count in both directions. */
export type RouteRecord = {
  from: string;
  to: string;
  /** A car left out shows "Hubungi kami" on this route. */
  carPrices: CarPrices;
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

/** A photo on the Gallery page. Every language of the caption may be empty: the photo then shows without one. */
export type GalleryPhotoRecord = {
  id: string;
  /** A Supabase Storage key ("gallery/<uuid>.webp"). */
  photo: string;
  caption: Translations<string>;
  published: boolean;
};

export type ArticleText = {
  title: string;
  /** One or two sentences on the article list. */
  excerpt: string;
  /**
   * Plain text. A blank line starts a new paragraph, a line starting "## " is a heading and lines starting "- " are
   * a bulleted list (see src/lib/article-body.ts).
   */
  body: string;
};

export type ArticleRecord = {
  slug: string;
  text: Translations<ArticleText>;
  /** A Supabase Storage key ("articles/<uuid>.webp"); null shows the article without a photo. */
  cover: string | null;
  /** Extra photos shown under the body, in order. */
  photos: string[];
  /** The date shown on the article, "2026-11-27". Articles are listed newest first by it. */
  publishedOn: string;
  published: boolean;
  /** Only on the samples shown before the first real article: kept out of search engines and the sitemap. */
  sample?: boolean;
};

export type SiteSettings = {
  businessName: string;
  /** The registered company behind the brand, "PT Jogja Transport Sukses Mandiri". Empty hides it. */
  companyName: string;
  /** The company's own website, which the company name links to. Empty shows the name without a link. */
  companyUrl: string;
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

/**
 * The fixed photos on the home page the client can swap: the big one at the top, the four interest tiles and
 * the drivers feature. A slot with no saved photo shows the one the site launched with (the top photo: the first
 * package's).
 */
export const homePhotoSlots = ["hero", "temples", "culture", "nature", "adventure", "drivers"] as const;
export type HomePhotoSlot = (typeof homePhotoSlots)[number];

/** Uploaded photo keys ("home/<uuid>.webp") by slot; a missing slot keeps the built-in photo. */
export type HomePhotos = Partial<Record<HomePhotoSlot, string>>;

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
