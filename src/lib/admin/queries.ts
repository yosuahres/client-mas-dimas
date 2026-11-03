import "server-only";

import { requireAdmin } from "@/lib/admin/session";
import {
  faqFromRow,
  placeFromRow,
  reviewFromRow,
  routeFromRow,
  settingsFromRow,
  tables,
  tourFromRow,
  vehicleFromRow,
  type FaqRow,
  type PlaceRow,
  type ReviewRow,
  type RouteRow,
  type SettingsRow,
  type TourRow,
  type VehicleRow,
} from "@/lib/content/rows";
import type { Locale } from "@/i18n/config";

// What the admin pages show: fresh from the database (never cached), hidden items included.

async function selectAll<Row>(table: string): Promise<Row[]> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from(table).select("*").order("position");
  if (error) throw new Error(`Couldn't read ${table}: ${error.message}`);
  return data as Row[];
}

export async function adminTours() {
  return (await selectAll<TourRow>(tables.tours)).map(tourFromRow);
}

export async function adminTour(slug: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from(tables.tours).select("*").eq("slug", slug).maybeSingle<TourRow>();
  if (error) throw new Error(`Couldn't read the package: ${error.message}`);
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
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from(tables.settings).select("*").eq("id", 1).maybeSingle<SettingsRow>();
  if (error) throw new Error(`Couldn't read the business details: ${error.message}`);
  return data ? settingsFromRow(data) : null;
}

/** Saved page-text edits, by locale then dotted key. */
export async function adminTextOverrides() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from(tables.text).select("locale, key, value");
  if (error) throw new Error(`Couldn't read the website text: ${error.message}`);
  const byLocale: Record<Locale, Record<string, string>> = { en: {}, id: {}, fr: {} };
  for (const row of data as { locale: Locale; key: string; value: string }[]) byLocale[row.locale][row.key] = row.value;
  return byLocale;
}
