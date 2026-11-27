import type { Metadata } from "next";

import { PhotoGrid } from "@/components/gallery/photo-grid";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { PageHeader } from "@/components/page-header";

import { fill } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/page-metadata";
import { getGallery } from "@/lib/content/public";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).gallery;
  return pageMetadata("/gallery", t.title, t.metaDescription);
}

export default async function GalleryPage() {
  const locale = await getLocale();
  const t = (await getDictionary()).gallery;
  const photos = await getGallery(locale);

  return (
    <>
      <SiteHeader path="/gallery" />
      <main>
        <PageHeader title={t.title} look="plain" aside={photos.length > 0 ? fill(t.count, { count: photos.length }) : null} />
        <div className="mx-auto max-w-7xl px-5 pt-8 pb-14 sm:px-8 sm:pt-10 sm:pb-20">
          {photos.length > 0 ? (
            <PhotoGrid photos={photos} text={t} fallbackAlt={t.title} />
          ) : (
            <p className="text-ink-muted">{t.empty}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
