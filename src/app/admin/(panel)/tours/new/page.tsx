import type { Metadata } from "next";

import { PageBody, PageHeader } from "@/components/admin/page-header";
import { TourForm } from "@/app/admin/(panel)/tours/tour-form";

export const metadata: Metadata = { title: "New package" };

export default function NewTourPage() {
  return (
    <>
      <PageHeader title="New package" parent={{ href: "/admin/tours", title: "Tour packages" }} />
      <PageBody width="max-w-3xl">
        <TourForm tour={null} photoPreview={null} />
      </PageBody>
    </>
  );
}
