import { notFound } from "next/navigation";
import { lang } from "next/root-params";

import { hasLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { applyTextOverrides } from "@/i18n/text-paths";
import { loadTextOverrides } from "@/lib/content/store";

export const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/i18n/dictionaries/en").then((module) => module.en),
  id: () => import("@/i18n/dictionaries/id").then((module) => module.id),
  fr: () => import("@/i18n/dictionaries/fr").then((module) => module.fr),
};

/** The locale of the current route, read from the [lang] root segment. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!value || !hasLocale(value)) notFound();
  return value;
}

/** The page text for the current locale, with the edits made in /admin/text. */
export async function getDictionary() {
  return getDictionaryFor(await getLocale());
}

/** getDictionary for route handlers (share images), which can't read the [lang] root param and take it from params. */
export async function getDictionaryFor(locale: Locale) {
  const [dictionary, overrides] = await Promise.all([dictionaries[locale](), loadTextOverrides(locale)]);
  return applyTextOverrides(dictionary, overrides);
}
