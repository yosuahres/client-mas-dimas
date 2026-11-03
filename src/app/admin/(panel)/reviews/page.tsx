import type { Metadata } from "next";

import { ReviewsManager } from "@/app/admin/(panel)/reviews/reviews-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminReviews, adminSettings, adminTours } from "@/lib/admin/queries";
import { translateFields } from "@/lib/content/translate";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const [reviews, tours, settings] = await Promise.all([adminReviews(), adminTours(), adminSettings()]);
  return (
    <>
      <PageHeader title="Reviews" />
      <PageBody>
        <ReviewsManager
          reviews={reviews}
          tours={tours.map((tour) => ({ value: tour.slug, label: `${tour.code} · ${translateFields(tour.text, "id").name}` }))}
          googleReviewsUrl={settings?.googleReviewsUrl ?? "https://www.google.com/maps"}
        />
      </PageBody>
    </>
  );
}
