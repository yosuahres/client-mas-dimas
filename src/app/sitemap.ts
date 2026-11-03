import type { MetadataRoute } from "next";

import { defaultLocale, localePath, locales } from "@/i18n/config";
import { getSite, getTours } from "@/lib/content/public";

const pages = ["/", "/tours", "/transfer", "/plan-your-visit", "/how-to-book", "/faq"];

// Every public page in each language, each listing its translations (hreflang), plus every published package
// with its photo. /admin is left out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, tours] = await Promise.all([getSite(), getTours(defaultLocale)]);
  const absolute = (path: string) => new URL(path, site.siteUrl).toString();

  const entries = [
    ...pages.map((path) => ({ path, photo: null })),
    ...tours.map((tour) => ({ path: `/tours/${tour.slug}`, photo: tour.photo })),
  ];

  return entries.flatMap(({ path, photo }) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, absolute(localePath(locale, path))]));
    return locales.map((locale) => ({
      url: languages[locale],
      alternates: { languages: { ...languages, "x-default": absolute(path) } },
      ...(photo && { images: [absolute(photo)] }),
    }));
  });
}
