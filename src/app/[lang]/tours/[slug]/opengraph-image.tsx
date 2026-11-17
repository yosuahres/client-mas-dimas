import { notFound } from "next/navigation";

import { hasLocale } from "@/i18n/config";
import { getSite, getTour } from "@/lib/content/public";
import { defaultSharePhoto, shareCardContentType, shareCardResponse, shareCardSize } from "@/lib/share-card";

type Params = { lang: string; slug: string };

async function findTour({ lang, slug }: Params) {
  return hasLocale(lang) ? getTour(lang, slug) : undefined;
}

// A package's own share card: its photo, name and duration. Packages without a photo use the site's Borobudur card.
export async function generateImageMetadata({ params }: { params: Params | Promise<Params> }) {
  const tour = await findTour(await params);
  return [
    {
      id: "card",
      alt: tour?.photo ? tour.photoAlt : defaultSharePhoto.alt,
      size: shareCardSize,
      contentType: shareCardContentType,
    },
  ];
}

export default async function OpenGraphImage({ params }: { params: Promise<Params> }) {
  const [tour, site] = await Promise.all([findTour(await params), getSite()]);
  if (!tour) notFound();

  return shareCardResponse({
    businessName: site.businessName,
    kicker: tour.duration,
    headline: tour.name,
    photo: tour.photo ?? defaultSharePhoto.src,
  });
}
