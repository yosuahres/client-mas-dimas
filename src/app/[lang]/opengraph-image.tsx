import { notFound } from "next/navigation";

import { hasLocale } from "@/i18n/config";
import { getDictionaryFor } from "@/i18n/server";
import { getSite } from "@/lib/content/public";
import { defaultSharePhoto, shareCardContentType, shareCardResponse, shareCardSize } from "@/lib/share-card";

// The share card in each language: Borobudur at sunrise with the business name and the site's headline.
// Pages under [lang] inherit it; package pages have their own in tours/[slug].
export const alt = defaultSharePhoto.alt;
export const size = shareCardSize;
export const contentType = shareCardContentType;

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [t, site] = await Promise.all([getDictionaryFor(lang).then((dictionary) => dictionary.meta), getSite()]);

  return shareCardResponse({
    businessName: site.businessName,
    kicker: t.city,
    headline: t.title,
    photo: defaultSharePhoto.src,
  });
}
