import type { Metadata } from "next";

import { FleetManager } from "@/app/admin/(panel)/fleet/fleet-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminVehicles } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Mobil & harga" };

export default async function FleetPage() {
  const vehicles = await adminVehicles();
  return (
    <>
      <PageHeader title="Mobil & harga" />
      <PageBody>
        <FleetManager vehicles={vehicles} />
      </PageBody>
    </>
  );
}
