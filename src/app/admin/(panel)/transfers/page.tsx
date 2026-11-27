import type { Metadata } from "next";

import { PlacesManager } from "@/app/admin/(panel)/transfers/places-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminPlaces, adminRoutes, adminVehicles } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Antar jemput" };

export default async function TransfersPage() {
  const [places, routes, cars] = await Promise.all([adminPlaces(), adminRoutes(), adminVehicles()]);
  return (
    <>
      <PageHeader title="Antar jemput" />
      <PageBody>
        <PlacesManager places={places} routes={routes} cars={cars} />
      </PageBody>
    </>
  );
}
