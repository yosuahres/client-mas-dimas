// Package and transfer prices are fixed per car, typed in the admin (TourRecord.carPrices, RouteRecord.carPrices).
// All amounts are whole rupiah. Every price is per vehicle, never per person.
import type { CarPrices } from "@/lib/content/schema";

/** The lowest of these cars' prices for a package, for "From Rp …". Null when every car is on request. */
export function cheapestCarPrice(prices: CarPrices, vehicles: { id: string }[]) {
  const known = vehicles.flatMap((vehicle) => (Object.hasOwn(prices, vehicle.id) ? [prices[vehicle.id]] : []));
  return known.length > 0 ? Math.min(...known) : null;
}

/** A package's price in this car, or null when it's quoted on request. */
export function carPrice(prices: CarPrices, vehicle: { id: string }) {
  return Object.hasOwn(prices, vehicle.id) ? prices[vehicle.id] : null;
}
