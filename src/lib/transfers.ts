// Private transfers: your own car and driver from one place to another, priced per car by distance.
// Places, popular routes and per-car rates are edited in /admin/transfers and /admin/fleet, and read with
// getPlaces(), getPopularRoutes() and getTransferVehicles() from @/lib/content/public.
// These helpers also run in the browser (trip search), so the data is passed in.

import type { FareRate, PlaceKind, RouteRecord } from "@/lib/content/schema";
import { transferFare } from "@/lib/pricing";

export { placeKinds } from "@/lib/content/schema";
export type { PlaceKind };

export type Place = {
  id: string;
  kind: PlaceKind;
  lat: number;
  lng: number;
  name: string;
};

/** A car offered for transfers, with its per-car rate. */
export type TransferVehicle = {
  id: string;
  name: string;
  seats: string;
  rate: FareRate;
};

export type PopularRoute = RouteRecord;

export function findPlace(places: Place[], id: string): Place | undefined {
  return places.find((place) => place.id === id);
}

export type RouteEstimate = {
  distanceKm: number;
  minutes: number;
};

// PLACEHOLDER estimate: straight-line distance stretched by a typical road factor.
// Replace with real road distances (a routing API on the server, or a fixed table the client agrees)
// before prices are shown as final.
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
  seats: string;
  totalIdr: number;
};

/** A price for every transfer car over this distance, cheapest first. */
export function quoteTransfer(vehicles: TransferVehicle[], distanceKm: number): VehicleQuote[] {
  return vehicles
    .map(({ id, name, seats, rate }) => ({ vehicle: id, name, seats, totalIdr: transferFare(rate, distanceKm) }))
    .toSorted((a, b) => a.totalIdr - b.totalIdr);
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
