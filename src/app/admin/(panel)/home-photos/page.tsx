import type { Metadata } from "next";

import { HomePhotosForm, type HomePhotoField } from "@/app/admin/(panel)/home-photos/home-photos-form";
import batik from "@/assets/photos/batik.jpg";
import jomblang from "@/assets/photos/jomblang.jpg";
import kraton from "@/assets/photos/kraton.jpg";
import merapi from "@/assets/photos/merapi.jpg";
import prambanan from "@/assets/photos/prambanan.jpg";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminHomePhotos, adminTours } from "@/lib/admin/queries";
import { translateFields } from "@/lib/content/translate";
import { photoUrl } from "@/lib/photos";

export const metadata: Metadata = { title: "Home page photos" };

export default async function HomePhotosPage() {
  const [photos, tours] = await Promise.all([adminHomePhotos(), adminTours()]);
  const firstTour = tours.find((tour) => tour.published);

  const slots: Omit<HomePhotoField, "photo" | "preview">[] = [
    {
      slot: "hero",
      title: "Big photo at the top",
      description: `Until you choose one, this is the photo of the first package${firstTour ? ` (${translateFields(firstTour.text, "id").name})` : ""}. After changing it, update “Photo description” under Website text → Home page → Big photo at the top.`,
      builtIn: photoUrl(firstTour?.photo ?? null),
    },
    { slot: "temples", title: "Tile: Temples", builtIn: prambanan.src },
    { slot: "culture", title: "Tile: Culture", builtIn: kraton.src },
    { slot: "nature", title: "Tile: Nature", builtIn: merapi.src },
    { slot: "adventure", title: "Tile: Adventure", builtIn: jomblang.src },
    {
      slot: "drivers",
      title: "Drivers section",
      description: "After changing it, update “Photo description” under Website text → Home page → Drivers.",
      builtIn: batik.src,
    },
  ];
  const fields: HomePhotoField[] = slots.map((field) => {
    const photo = photos?.[field.slot] ?? null;
    return { ...field, photo, preview: photoUrl(photo) };
  });

  return (
    <>
      <PageHeader title="Home page photos" />
      <PageBody>
        {photos === null ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Run <code>supabase/migrations/20261122000000_home_photos.sql</code> in the Supabase SQL Editor to change these photos.
          </p>
        ) : (
          <HomePhotosForm fields={fields} />
        )}
      </PageBody>
    </>
  );
}
