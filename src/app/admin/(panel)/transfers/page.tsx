import type { Metadata } from "next";

import { PlacesManager } from "@/app/admin/(panel)/transfers/places-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminPlaces, adminRoutes } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Places & routes" };

export default async function TransfersPage() {
  const [places, routes] = await Promise.all([adminPlaces(), adminRoutes()]);
  return (
    <>
      <PageHeader title="Places & routes" />
      <PageBody>
        <PlacesManager places={places} routes={routes} />
      </PageBody>
    </>
  );
}
