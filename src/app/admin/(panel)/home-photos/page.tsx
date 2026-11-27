import type { Metadata } from "next";

import { HomePhotosForm, type HomePhotoField } from "@/app/admin/(panel)/home-photos/home-photos-form";
import batik from "@/assets/photos/batik.jpg";
import jomblang from "@/assets/photos/jomblang.jpg";
import kraton from "@/assets/photos/kraton.jpg";
import merapi from "@/assets/photos/merapi.jpg";
import prambanan from "@/assets/photos/prambanan.jpg";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminHomePhotos, adminTours } from "@/lib/admin/queries";
import { photoUrl } from "@/lib/photos";

export const metadata: Metadata = { title: "Foto beranda" };

export default async function HomePhotosPage() {
  const [photos, tours] = await Promise.all([adminHomePhotos(), adminTours()]);
  const firstTour = tours.find((tour) => tour.published);

  const slots: Omit<HomePhotoField, "photo" | "preview">[] = [
    { slot: "hero", title: "Foto besar di atas", builtIn: photoUrl(firstTour?.photo ?? null) },
    { slot: "temples", title: "Kotak: Candi", builtIn: prambanan.src },
    { slot: "culture", title: "Kotak: Budaya", builtIn: kraton.src },
    { slot: "nature", title: "Kotak: Alam", builtIn: merapi.src },
    { slot: "adventure", title: "Kotak: Petualangan", builtIn: jomblang.src },
    { slot: "drivers", title: "Bagian sopir", builtIn: batik.src },
  ];
  const fields: HomePhotoField[] = slots.map((field) => {
    const photo = photos?.[field.slot] ?? null;
    return { ...field, photo, preview: photoUrl(photo) };
  });

  return (
    <>
      <PageHeader title="Foto beranda" />
      <PageBody>
        {photos === null ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Jalankan <code>supabase/migrations/20261122000000_home_photos.sql</code> di SQL Editor Supabase supaya foto-foto ini bisa diganti.
          </p>
        ) : (
          <HomePhotosForm fields={fields} />
        )}
      </PageBody>
    </>
  );
}
