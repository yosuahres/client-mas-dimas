import type { Metadata } from "next";

import { PageBody, PageHeader } from "@/components/admin/page-header";
import { TourForm } from "@/app/admin/(panel)/tours/tour-form";

export const metadata: Metadata = { title: "Paket baru" };

export default function NewTourPage() {
  return (
    <>
      <PageHeader title="Paket baru" parent={{ href: "/admin/tours", title: "Paket tour" }} />
      <PageBody>
        <TourForm tour={null} photoPreview={null} />
      </PageBody>
    </>
  );
}
