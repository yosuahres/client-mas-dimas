import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { Locale } from "@/i18n/config";
import { defaultContent } from "@/lib/content/defaults";
import { sampleArticles, sampleGallery } from "@/lib/content/samples";
import {
  articleFromRow,
  faqFromRow,
  galleryPhotoFromRow,
  homePhotosFromRows,
  placeFromRow,
  reviewFromRow,
  routeFromRow,
  settingsFromRow,
  tables,
  tourFromRow,
  vehicleFromRow,
  type ArticleRow,
  type FaqRow,
  type GalleryPhotoRow,
  type HomePhotoRow,
  type PlaceRow,
  type ReviewRow,
  type RouteRow,
  type SettingsRow,
  type TourRow,
  type VehicleRow,
} from "@/lib/content/rows";
import type {
  ArticleRecord,
  FaqRecord,
  GalleryPhotoRecord,
  HomePhotos,
  PlaceRecord,
  ReviewRecord,
  RouteRecord,
  SiteSettings,
  TextOverrides,
  TourRecord,
  VehicleRecord,
} from "@/lib/content/schema";
import { createPublicClient } from "@/lib/supabase/clients";
import { supabaseConfig } from "@/lib/supabase/config";

// The published content the public site reads. Cached, and expired by the admin's server actions
// through these tags; the hourly lifetime catches edits made straight in the Supabase dashboard.
// Until Supabase is configured, every reader returns the content the site launched with.

export const contentTags = {
  settings: "content:settings",
  tours: "content:tours",
  vehicles: "content:vehicles",
  places: "content:places",
  routes: "content:routes",
  reviews: "content:reviews",
  faqs: "content:faqs",
  text: "content:text",
  homePhotos: "content:home-photos",
  gallery: "content:gallery",
  articles: "content:articles",
} as const;

function usingDefaults() {
  return supabaseConfig() === null;
}

async function selectAll<Row>(table: string): Promise<Row[]> {
  const { data, error } = await createPublicClient().from(table).select("*").order("position");
  if (error) throw new Error(`Couldn't read ${table} from Supabase: ${error.message}`);
  return data as Row[];
}

export async function loadSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.settings);
  if (usingDefaults()) return defaultContent.settings;

  const { data, error } = await createPublicClient().from(tables.settings).select("*").eq("id", 1).maybeSingle<SettingsRow>();
  if (error) throw new Error(`Couldn't read site settings from Supabase: ${error.message}`);
  if (!data) throw new Error("site_settings is empty: run supabase/seed.sql on the database");
  return settingsFromRow(data);
}

export async function loadTours(): Promise<TourRecord[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.tours);
  if (usingDefaults()) return defaultContent.tours.filter((tour) => tour.published);
  return (await selectAll<TourRow>(tables.tours)).map(tourFromRow);
}

export async function loadVehicles(): Promise<VehicleRecord[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.vehicles);
  if (usingDefaults()) return defaultContent.vehicles.filter((vehicle) => vehicle.published);
  return (await selectAll<VehicleRow>(tables.vehicles)).map(vehicleFromRow);
}

export async function loadPlaces(): Promise<PlaceRecord[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.places);
  if (usingDefaults()) return defaultContent.places.filter((place) => place.published);
  return (await selectAll<PlaceRow>(tables.places)).map(placeFromRow);
}

export async function loadRoutes(): Promise<RouteRecord[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.routes, contentTags.places);
  if (usingDefaults()) return defaultContent.routes;
  return (await selectAll<RouteRow>(tables.routes)).map(routeFromRow).map(({ from, to, carPrices }) => ({ from, to, carPrices }));
}

export async function loadReviews(): Promise<ReviewRecord[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.reviews);
  if (usingDefaults()) return defaultContent.reviews.filter((review) => review.published);
  return (await selectAll<ReviewRow>(tables.reviews)).map(reviewFromRow);
}

export async function loadFaqs(): Promise<FaqRecord[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.faqs);
  if (usingDefaults()) return defaultContent.faqs.filter((faq) => faq.published);
  return (await selectAll<FaqRow>(tables.faqs)).map(faqFromRow);
}

export async function loadTextOverrides(locale: Locale): Promise<TextOverrides> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.text);
  if (usingDefaults()) return {};

  const { data, error } = await createPublicClient().from(tables.text).select("key, value").eq("locale", locale);
  if (error) throw new Error(`Couldn't read page text from Supabase: ${error.message}`);
  return Object.fromEntries((data as { key: string; value: string }[]).map(({ key, value }) => [key, value]));
}

export async function loadHomePhotos(): Promise<HomePhotos> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.homePhotos);
  if (usingDefaults()) return {};

  const { data, error } = await createPublicClient().from(tables.homePhotos).select("slot, photo");
  if (error) {
    // No such table (42P01 from Postgres, PGRST205 from the API): the 20261122 migration hasn't run yet, so nothing is replaced.
    if (error.code === "42P01" || error.code === "PGRST205") return {};
    throw new Error(`Couldn't read the home page photos from Supabase: ${error.message}`);
  }
  return homePhotosFromRows(data as HomePhotoRow[]);
}

/** No such table (42P01 from Postgres, PGRST205 from the API): its migration hasn't run yet. */
function isMissingTable(error: { code?: string }) {
  return error.code === "42P01" || error.code === "PGRST205";
}

/** Published gallery photos, in the order set in the admin panel. Samples while Supabase isn't connected. */
export async function loadGallery(): Promise<GalleryPhotoRecord[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.gallery);
  if (usingDefaults()) return sampleGallery;

  const { data, error } = await createPublicClient().from(tables.gallery).select("*").order("position");
  if (error) {
    if (isMissingTable(error)) return [];
    throw new Error(`Couldn't read the gallery from Supabase: ${error.message}`);
  }
  return (data as GalleryPhotoRow[]).map(galleryPhotoFromRow);
}

/** Published articles, newest first. Samples while Supabase isn't connected. */
export async function loadArticles(): Promise<ArticleRecord[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentTags.articles);
  if (usingDefaults()) return sampleArticles;

  const { data, error } = await createPublicClient()
    .from(tables.articles)
    .select("*")
    .order("published_on", { ascending: false })
    .order("updated_at", { ascending: false });
  if (error) {
    if (isMissingTable(error)) return [];
    throw new Error(`Couldn't read the articles from Supabase: ${error.message}`);
  }
  return (data as ArticleRow[]).map(articleFromRow);
}
