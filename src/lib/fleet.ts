// The cars Jogja Travel drives, with their day rates, how many people fit, and their price level for packages.
// Edited in /admin/fleet; read with getFleet() from @/lib/content/public. All amounts are whole rupiah.
// These helpers also run in the browser (booking card), so the data is passed in.
import type { VehicleRecord } from "@/lib/content/schema";
import type { Party } from "@/lib/party";

export type Vehicle = Omit<VehicleRecord, "published">;

export type Capacity = Pick<Vehicle, "maxPassengers" | "maxPassengersWithLuggage">;

/** Seats a party needs: adults and children. Babies ride on a lap. */
export function seatsNeeded(party: Party) {
  return party.adults + party.kids;
}

/** How many adults and children this car takes, with or without big luggage. */
export function seatsIn(vehicle: Capacity, luggage: boolean) {
  return luggage ? vehicle.maxPassengersWithLuggage : vehicle.maxPassengers;
}

export function fitsParty(vehicle: Capacity, party: Party) {
  return seatsNeeded(party) <= seatsIn(vehicle, party.luggage);
}

/**
 * The car to suggest for this party: of the cars it fits in, the cheapest (lowest price level), then the
 * smallest. Undefined when the party is bigger than every car.
 */
export function recommendVehicle<V extends Capacity & Pick<Vehicle, "tourPricePercent">>(fleet: V[], party: Party): V | undefined {
  return fleet
    .filter((vehicle) => fitsParty(vehicle, party))
    .toSorted(
      (a, b) => a.tourPricePercent - b.tourPricePercent || seatsIn(a, party.luggage) - seatsIn(b, party.luggage),
    )[0];
}
