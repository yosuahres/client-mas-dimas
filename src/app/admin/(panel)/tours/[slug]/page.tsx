import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageBody, PageHeader } from "@/components/admin/page-header";
import { TourForm } from "@/app/admin/(panel)/tours/tour-form";
import { adminTour, adminVehicles } from "@/lib/admin/queries";
import { photoUrl } from "@/lib/photos";
import { translateFields } from "@/lib/content/translate";

export const metadata: Metadata = { title: "Ubah paket" };

export default async function EditTourPage({ params }: PageProps<"/admin/tours/[slug]">) {
  const { slug } = await params;
  const [tour, cars] = await Promise.all([adminTour(slug), adminVehicles()]);
  if (!tour) notFound();

  return (
    <>
      <PageHeader title={translateFields(tour.text, "id").name} parent={{ href: "/admin/tours", title: "Paket tour" }} />
      <PageBody>
        {/* Keyed so the form starts fresh after a save that renames the package */}
        <TourForm key={tour.slug} tour={tour} photoPreview={photoUrl(tour.photo)} cars={cars} />
      </PageBody>
    </>
  );
}
