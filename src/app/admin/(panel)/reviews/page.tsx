import type { Metadata } from "next";

import { ReviewsManager } from "@/app/admin/(panel)/reviews/reviews-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminReviews, adminTours } from "@/lib/admin/queries";
import { translateFields } from "@/lib/content/translate";

export const metadata: Metadata = { title: "Ulasan" };

export default async function ReviewsPage() {
  const [reviews, tours] = await Promise.all([adminReviews(), adminTours()]);
  return (
    <>
      <PageHeader title="Ulasan" />
      <PageBody>
        <ReviewsManager
          reviews={reviews}
          tours={tours.map((tour) => ({ value: tour.slug, label: `${tour.code} · ${translateFields(tour.text, "id").name}` }))}
        />
      </PageBody>
    </>
  );
}
