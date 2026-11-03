// Pure price calculation, shared by the pages and (later) the server-side checkout.
// All amounts are whole rupiah. Every price is per vehicle, never per person.
import type { FareRate } from "@/lib/content/schema";

export type { FareRate };

const FARE_ROUNDING_IDR = 5_000;

/** Price of one car over a distance, rounded up to the next 5,000 rupiah. */
export function transferFare(rate: FareRate, distanceKm: number) {
  if (!Number.isInteger(distanceKm) || distanceKm < 1) {
    throw new RangeError(`Distance must be a whole number of kilometres, at least 1, got ${distanceKm}`);
  }
  const raw = Math.max(rate.minimumIdr, rate.baseIdr + rate.perKmIdr * distanceKm);
  return Math.ceil(raw / FARE_ROUNDING_IDR) * FARE_ROUNDING_IDR;
}
