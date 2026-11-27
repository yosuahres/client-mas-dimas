import type { Metadata } from "next";

import { PageBody, PageHeader } from "@/components/admin/page-header";
import { TourForm } from "@/app/admin/(panel)/tours/tour-form";
import { adminVehicles } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Paket baru" };

export default async function NewTourPage() {
  const cars = await adminVehicles();
  return (
    <>
      <PageHeader title="Paket baru" parent={{ href: "/admin/tours", title: "Paket tour" }} />
      <PageBody>
        <TourForm tour={null} photoPreview={null} cars={cars} />
      </PageBody>
    </>
  );
}
