// The cars Jogja Travel drives, with their day rates, how many people fit, and their price level for packages.
// Edited in /admin/fleet; read with getFleet() from @/lib/content/public. All amounts are whole rupiah.
// These helpers also run in the browser (booking card), so the data is passed in.
import { seatClasses, type SeatClass, type VehicleRecord } from "@/lib/content/schema";
import type { Party } from "@/lib/party";

export { seatClasses };
export type { SeatClass };

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

export type SeatOption<V> = {
  seatClass: SeatClass;
  /** The cheapest car in this group the party fits in: its price is the group's price. */
  vehicle: V;
  /** Every car in this group the party fits in, cheapest first. */
  vehicles: V[];
};

/**
 * The seat groups to offer a party: the smallest group they fit in and the next one up (`shown`), each with its
 * cars that fit, cheapest first by `cost`. One person sees 5 and 7 seater; six with luggage, 7 seater and above.
 */
export function seatOptions<V extends Capacity & Pick<Vehicle, "seatClass">>(
  fleet: V[],
  party: Party,
  cost: (vehicle: V) => number,
  shown = 2,
): SeatOption<V>[] {
  return seatClasses
    .flatMap((seatClass) => {
      const vehicles = fleet
        .filter((vehicle) => vehicle.seatClass === seatClass && fitsParty(vehicle, party))
        .toSorted((a, b) => cost(a) - cost(b));
      return vehicles.length > 0 ? [{ seatClass, vehicle: vehicles[0], vehicles }] : [];
    })
    .slice(0, shown);
}
