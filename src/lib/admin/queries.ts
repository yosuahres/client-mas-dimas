import "server-only";

import { readAsAdmin } from "@/lib/admin/session";
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
import type { Locale } from "@/i18n/config";

// What the admin pages show: fresh from the database (never cached), hidden items included.
// Each read starts at once, alongside the session check that readAsAdmin shares across the request.

async function selectAll<Row>(table: string): Promise<Row[]> {
  const { data, error } = await readAsAdmin((supabase) => supabase.from(table).select("*").order("position"));
  if (error) throw new Error(`Gagal membaca ${table}: ${error.message}`);
  return data as Row[];
}

export async function adminTours() {
  return (await selectAll<TourRow>(tables.tours)).map(tourFromRow);
}

export async function adminTour(slug: string) {
  const { data, error } = await readAsAdmin((supabase) =>
    supabase.from(tables.tours).select("*").eq("slug", slug).maybeSingle<TourRow>(),
  );
  if (error) throw new Error(`Gagal membaca paket: ${error.message}`);
  return data ? tourFromRow(data) : null;
}

export async function adminVehicles() {
  return (await selectAll<VehicleRow>(tables.vehicles)).map(vehicleFromRow);
}

export async function adminPlaces() {
  return (await selectAll<PlaceRow>(tables.places)).map(placeFromRow);
}

export async function adminRoutes() {
  return (await selectAll<RouteRow>(tables.routes)).map(routeFromRow);
}

export async function adminReviews() {
  return (await selectAll<ReviewRow>(tables.reviews)).map(reviewFromRow);
}

export async function adminFaqs() {
  return (await selectAll<FaqRow>(tables.faqs)).map(faqFromRow);
}

export async function adminSettings() {
  const { data, error } = await readAsAdmin((supabase) =>
    supabase.from(tables.settings).select("*").eq("id", 1).maybeSingle<SettingsRow>(),
  );
  if (error) throw new Error(`Gagal membaca data usaha: ${error.message}`);
  return data ? settingsFromRow(data) : null;
}

/** The home page photos the client replaced, by slot. Empty until the 20261122 migration has run. */
export async function adminHomePhotos() {
  const { data, error } = await readAsAdmin((supabase) => supabase.from(tables.homePhotos).select("slot, photo"));
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return null;
    throw new Error(`Gagal membaca foto beranda: ${error.message}`);
  }
  return homePhotosFromRows(data as HomePhotoRow[]);
}

/** Saved page-text edits, by locale then dotted key. */
export async function adminTextOverrides() {
  const { data, error } = await readAsAdmin((supabase) => supabase.from(tables.text).select("locale, key, value"));
  if (error) throw new Error(`Gagal membaca teks website: ${error.message}`);
  const byLocale: Record<Locale, Record<string, string>> = { en: {}, id: {}, fr: {} };
  for (const row of data as { locale: Locale; key: string; value: string }[]) byLocale[row.locale][row.key] = row.value;
  return byLocale;
}

const isMissingTable = (error: { code?: string }) => error.code === "42P01" || error.code === "PGRST205";

/** Every gallery photo, hidden ones included. Null until the 20261127 migration has run. */
export async function adminGallery() {
  const { data, error } = await readAsAdmin((supabase) => supabase.from(tables.gallery).select("*").order("position"));
  if (error) {
    if (isMissingTable(error)) return null;
    throw new Error(`Gagal membaca galeri: ${error.message}`);
  }
  return (data as GalleryPhotoRow[]).map(galleryPhotoFromRow);
}

/** Every article, newest first, drafts included. Null until the 20261127 migration has run. */
export async function adminArticles() {
  const { data, error } = await readAsAdmin((supabase) =>
    supabase.from(tables.articles).select("*").order("published_on", { ascending: false }).order("updated_at", { ascending: false }),
  );
  if (error) {
    if (isMissingTable(error)) return null;
    throw new Error(`Gagal membaca artikel: ${error.message}`);
  }
  return (data as ArticleRow[]).map(articleFromRow);
}

export async function adminArticle(slug: string) {
  const { data, error } = await readAsAdmin((supabase) => supabase.from(tables.articles).select("*").eq("slug", slug).maybeSingle<ArticleRow>());
  if (error) throw new Error(`Gagal membaca artikel: ${error.message}`);
  return data ? articleFromRow(data) : null;
}
