import type { Metadata } from "next";

import { GalleryManager } from "@/app/admin/(panel)/gallery/gallery-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminGallery } from "@/lib/admin/queries";
import { photoUrl } from "@/lib/photos";

export const metadata: Metadata = { title: "Galeri" };

export default async function GalleryAdminPage() {
  const photos = await adminGallery();

  return (
    <>
      <PageHeader title="Galeri" />
      <PageBody>
        {photos === null ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Jalankan <code>supabase/migrations/20261127000000_gallery_and_articles.sql</code> di SQL Editor Supabase supaya galeri bisa diisi.
          </p>
        ) : (
          <GalleryManager photos={photos.map((photo) => ({ ...photo, preview: photoUrl(photo.photo) ?? "" }))} />
        )}
      </PageBody>
    </>
  );
}
