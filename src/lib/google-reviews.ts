import "server-only";

import { cacheLife } from "next/cache";

import type { Locale } from "@/i18n/config";

// The business's rating and reviews from its Google Maps listing, read with the Places API (New).
// Google returns at most five reviews, the ones it ranks most relevant, in the language asked for
// (it machine-translates the rest). See docs/admin.md for the key and the Place ID.

const ENDPOINT = "https://places.googleapis.com/v1/places";
const FIELDS = "rating,userRatingCount,googleMapsUri,reviews";

export type GoogleReview = {
  id: string;
  authorName: string;
  /** The reviewer's Google Maps profile; Google requires the name to link to it. */
  authorUrl: string | null;
  rating: number;
  text: string;
  /** "3 months ago", in the visitor's language. */
  when: string;
  /** Google translated the text from the reviewer's language. */
  translated: boolean;
};

export type GoogleReviews = {
  rating: number;
  count: number;
  mapsUrl: string | null;
  reviews: GoogleReview[];
};

type LocalizedText = { text?: string; languageCode?: string };

type PlaceResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: {
    name: string;
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: LocalizedText;
    originalText?: LocalizedText;
    authorAttribution?: { displayName?: string; uri?: string };
  }[];
};

export function isGoogleReviewsConfigured() {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACE_ID);
}

/** The listing's rating and reviews, or null when it isn't set up or Google can't be reached. */
export async function loadGoogleReviews(locale: Locale): Promise<GoogleReviews | null> {
  "use cache";
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) {
    cacheLife("hours");
    return null;
  }

  try {
    const place = await fetchPlace(apiKey, placeId, locale);
    cacheLife("days");
    return place;
  } catch (error) {
    console.error("Google reviews:", error instanceof Error ? error.message : error);
    // Try again soon rather than showing the fallback reviews for a whole day.
    cacheLife("minutes");
    return null;
  }
}

async function fetchPlace(apiKey: string, placeId: string, locale: Locale): Promise<GoogleReviews | null> {
  const url = `${ENDPOINT}/${encodeURIComponent(placeId)}?languageCode=${locale}`;
  const response = await fetch(url, { headers: { "x-goog-api-key": apiKey, "x-goog-fieldmask": FIELDS } });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    throw new Error(`Places API refused the request (${response.status}${body?.error?.message ? `: ${body.error.message}` : ""})`);
  }

  const place = (await response.json()) as PlaceResponse;
  if (place.rating === undefined || !place.userRatingCount) return null;

  return {
    rating: place.rating,
    count: place.userRatingCount,
    mapsUrl: place.googleMapsUri ?? null,
    reviews: (place.reviews ?? []).flatMap((review) => {
      const text = review.text?.text?.trim();
      if (!text || !review.rating) return [];
      return [
        {
          id: review.name,
          authorName: review.authorAttribution?.displayName ?? "Google user",
          authorUrl: review.authorAttribution?.uri ?? null,
          rating: review.rating,
          text,
          when: review.relativePublishTimeDescription ?? "",
          translated: Boolean(review.originalText?.languageCode && review.originalText.languageCode !== review.text?.languageCode),
        },
      ];
    }),
  };
}
