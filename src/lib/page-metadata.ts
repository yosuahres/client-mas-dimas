import "server-only";

import type { Metadata } from "next";

import { languageAlternates } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { getLocale } from "@/i18n/server";
import { getSite } from "@/lib/content/public";

/**
 * Title, description and language links for an inner page. The layout adds "| <business name>" to the title;
 * {brand} in the description becomes the business name, so every page's search result names the business.
 */
export async function pageMetadata(path: string, title: string, description: string): Promise<Metadata> {
  const [locale, site] = await Promise.all([getLocale(), getSite()]);
  return {
    title,
    description: fill(description, { brand: site.businessName }),
    alternates: languageAlternates(locale, path),
  };
}
