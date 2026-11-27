import type { Metadata } from "next";

import { FleetManager } from "@/app/admin/(panel)/fleet/fleet-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminVehicles } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Mobil" };

// Only the cars themselves. Package prices per car are on each package, transfer prices on each route.
export default async function FleetPage() {
  const vehicles = await adminVehicles();
  return (
    <>
      <PageHeader title="Mobil" />
      <PageBody>
        <FleetManager vehicles={vehicles} />
      </PageBody>
    </>
  );
}
