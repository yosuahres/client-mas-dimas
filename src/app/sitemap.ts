import type { MetadataRoute } from "next";

import { defaultLocale, localePath, locales } from "@/i18n/config";
import { getArticles, getGallery, getSite, getTours } from "@/lib/content/public";

const pages = ["/", "/tours", "/transfer", "/gallery", "/articles", "/how-to-book", "/faq"];

type Entry = { path: string; photos: (string | null)[]; lastModified?: string };

// Every public page in each language, each listing its translations (hreflang), plus every published package and
// article. Photos are listed for image search: each package's and article's, and every gallery photo on /gallery.
// /admin and the sample articles shown before the first real one are left out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, tours, articles, gallery] = await Promise.all([
    getSite(),
    getTours(defaultLocale),
    getArticles(defaultLocale),
    getGallery(defaultLocale),
  ]);
  const absolute = (path: string) => new URL(path, site.siteUrl).toString();
  const realArticles = articles.filter((article) => !article.sample);

  const entries: Entry[] = [
    ...pages.map((path) => ({
      path,
      photos: path === "/gallery" ? gallery.map((photo) => photo.url) : [],
      // The articles page changes when an article is published
      lastModified: path === "/articles" ? realArticles[0]?.publishedOn : undefined,
    })),
    ...tours.map((tour) => ({ path: `/tours/${tour.slug}`, photos: [tour.photo] })),
    ...realArticles.map((article) => ({
      path: `/articles/${article.slug}`,
      photos: [article.cover, ...article.photos],
      lastModified: article.publishedOn,
    })),
  ];

  return entries.flatMap(({ path, photos, lastModified }) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, absolute(localePath(locale, path))]));
    const images = photos.flatMap((photo) => (photo ? [absolute(photo)] : []));
    return locales.map((locale) => ({
      url: languages[locale],
      alternates: { languages: { ...languages, "x-default": absolute(path) } },
      ...(lastModified && { lastModified }),
      ...(images.length > 0 && { images }),
    }));
  });
}
