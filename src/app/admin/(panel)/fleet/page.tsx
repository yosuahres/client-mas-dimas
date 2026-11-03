import type { Metadata } from "next";

import { FleetManager } from "@/app/admin/(panel)/fleet/fleet-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminVehicles } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Cars & prices" };

export default async function FleetPage() {
  const vehicles = await adminVehicles();
  return (
    <>
      <PageHeader title="Cars & prices" />
      <PageBody>
        <FleetManager vehicles={vehicles} />
      </PageBody>
    </>
  );
}
