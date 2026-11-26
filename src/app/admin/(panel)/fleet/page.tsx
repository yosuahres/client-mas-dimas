import type { Metadata } from "next";

import { FleetManager, type PriceSamples } from "@/app/admin/(panel)/fleet/fleet-manager";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminPlaces, adminRoutes, adminTours, adminVehicles } from "@/lib/admin/queries";
import { translate, translateFields } from "@/lib/content/translate";
import { estimateRoute } from "@/lib/transfers";

export const metadata: Metadata = { title: "Mobil & harga" };

export default async function FleetPage() {
  const [vehicles, tours, places, routes] = await Promise.all([adminVehicles(), adminTours(), adminPlaces(), adminRoutes()]);

  // Real examples for the car form, so the client sees what a guest pays instead of working out the formula.
  const tour = tours.find((candidate) => candidate.published && candidate.priceFromIdr !== null) ?? tours.find((candidate) => candidate.priceFromIdr !== null);
  const samples: PriceSamples = {
    tour: tour?.priceFromIdr ? { name: translateFields(tour.text, "id").name, priceIdr: tour.priceFromIdr } : null,
    routes: routes.slice(0, 2).flatMap((route) => {
      const from = places.find((place) => place.id === route.from);
      const to = places.find((place) => place.id === route.to);
      if (!from || !to || from.id === to.id) return [];
      return [{ name: `${translate(from.name, "id")} → ${translate(to.name, "id")}`, distanceKm: estimateRoute(from, to).distanceKm }];
    }),
  };

  return (
    <>
      <PageHeader title="Mobil & harga" />
      <PageBody>
        <FleetManager vehicles={vehicles} samples={samples} />
      </PageBody>
    </>
  );
}
