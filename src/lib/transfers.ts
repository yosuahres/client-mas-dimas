// Private transfers: your own car and driver from one place to another. Each route has a fixed price per car,
// typed in /admin/transfers; a trip with no route, or a car without a price on it, is quoted on request.
// Read with getPlaces(), getPopularRoutes() and getTransferVehicles() from @/lib/content/public.
// These helpers also run in the browser (trip search), so the data is passed in.

import type { CarPrices, PlaceKind, RouteRecord, SeatClass } from "@/lib/content/schema";
import { carPrice } from "@/lib/pricing";

export { placeKinds } from "@/lib/content/schema";
export type { PlaceKind };

export type Place = {
  id: string;
  kind: PlaceKind;
  lat: number;
  lng: number;
  name: string;
};

/** A car offered for transfers. Its price depends on the route. */
export type TransferVehicle = {
  id: string;
  name: string;
  seatClass: SeatClass;
  seats: string;
  maxPassengers: number;
  maxPassengersWithLuggage: number;
};

export type PopularRoute = RouteRecord;

export function findPlace(places: Place[], id: string): Place | undefined {
  return places.find((place) => place.id === id);
}

/** The fixed prices for a trip: its route, or the route the other way round. Null when there's no such route. */
export function routePrices(routes: PopularRoute[], from: string, to: string): CarPrices | null {
  const route =
    routes.find((candidate) => candidate.from === from && candidate.to === to) ??
    routes.find((candidate) => candidate.from === to && candidate.to === from);
  return route?.carPrices ?? null;
}

export type RouteEstimate = {
  distanceKm: number;
  minutes: number;
};

// The distance and time shown with a trip: straight-line distance stretched by a typical road factor. Only shown,
// never priced; a routing API on the server would make them exact.
const ROAD_FACTOR = 1.35;
const AVERAGE_SPEED_KMH = 45;

type Coordinates = Pick<Place, "id" | "lat" | "lng">;

function straightLineKm(a: Coordinates, b: Coordinates) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function estimateRoute(from: Coordinates, to: Coordinates): RouteEstimate {
  if (from.id === to.id) throw new RangeError("A transfer needs two different places");
  const distanceKm = Math.max(1, Math.round(straightLineKm(from, to) * ROAD_FACTOR));
  const minutes = Math.max(15, Math.round(((distanceKm / AVERAGE_SPEED_KMH) * 60) / 5) * 5);
  return { distanceKm, minutes };
}

export type VehicleQuote = {
  vehicle: string;
  name: string;
  seatClass: SeatClass;
  seats: string;
  maxPassengers: number;
  maxPassengersWithLuggage: number;
  /** Null when it's quoted on request. */
  totalIdr: number | null;
};

/** Every transfer car with its price on this route (null prices: no route), cheapest first, on request last. */
export function quoteTransfer(vehicles: TransferVehicle[], prices: CarPrices | null): VehicleQuote[] {
  return vehicles
    .map(({ id, name, seatClass, seats, maxPassengers, maxPassengersWithLuggage }) => ({
      vehicle: id,
      name,
      seatClass,
      seats,
      maxPassengers,
      maxPassengersWithLuggage,
      totalIdr: prices ? carPrice(prices, { id }) : null,
    }))
    .toSorted((a, b) => quoteCost(a) - quoteCost(b));
}

/** Sort key for a quote: on request goes last. */
export function quoteCost(quote: Pick<VehicleQuote, "totalIdr">) {
  return quote.totalIdr ?? Number.MAX_SAFE_INTEGER;
}

export type TransferSearch = {
  from: string;
  to: string;
  date?: string;
  time?: string;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Read a transfer search from URL params. Returns undefined when the route itself is missing or invalid. */
export function parseTransferSearch(
  params: Record<string, string | string[] | undefined>,
  places: Pick<Place, "id">[],
): TransferSearch | undefined {
  const read = (key: string) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  };
  const isPlace = (id: string) => places.some((place) => place.id === id);
  const from = read("from") ?? "";
  const to = read("to") ?? "";
  if (!isPlace(from) || !isPlace(to) || from === to) return undefined;

  const date = read("date");
  const time = read("time");
  return {
    from,
    to,
    date: date && DATE_PATTERN.test(date) ? date : undefined,
    time: time && TIME_PATTERN.test(time) ? time : undefined,
  };
}

export function transferHref(path: string, search: Pick<TransferSearch, "from" | "to"> & Partial<TransferSearch>) {
  const query = new URLSearchParams({ from: search.from, to: search.to });
  if (search.date) query.set("date", search.date);
  if (search.time) query.set("time", search.time);
  return `${path}?${query}`;
}
