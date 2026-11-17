// The guest's last few searches, kept in this browser only (localStorage), for "Recently searched" on the
// phone search screen. Only ids are stored; names come from the current content in the current language.
// Storage can be missing or blocked (private windows), so every read and write tolerates that.

import { clampGroup, defaultParty, partyGroups, type Party, type PartyGroup } from "@/lib/party";

export type RecentSearch =
  | { mode: "tours"; slug: string; date?: string; party: Party }
  | { mode: "transfer"; from: string; to: string; date?: string; time?: string; party: Party };

const STORAGE_KEY = "jogja-travel:recent-searches";
const CHANGE_EVENT = "jogja-travel:recent-searches";
const LIMIT = 8;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const NONE: RecentSearch[] = [];

let cachedRaw: string | null = null;
let cached: RecentSearch[] = NONE;

/** The saved searches, newest first. Returns the same array until storage changes (for useSyncExternalStore). */
export function getRecentSearches(): RecentSearch[] {
  const raw = readStorage();
  if (raw === cachedRaw) return cached;
  cachedRaw = raw;
  cached = parse(raw);
  return cached;
}

/** Nothing is stored on the server. */
export function getServerRecentSearches(): RecentSearch[] {
  return NONE;
}

export function subscribeToRecentSearches(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function saveRecentSearch(search: RecentSearch) {
  const others = getRecentSearches().filter((saved) => !isSameTrip(saved, search));
  writeStorage(JSON.stringify([search, ...others].slice(0, LIMIT)));
}

/** Forget the saved searches of one kind (the Clear link on that tab). */
export function clearRecentSearches(mode: RecentSearch["mode"]) {
  const kept = getRecentSearches().filter((saved) => saved.mode !== mode);
  writeStorage(kept.length > 0 ? JSON.stringify(kept) : null);
}

function isSameTrip(a: RecentSearch, b: RecentSearch) {
  if (a.mode === "tours" && b.mode === "tours") return a.slug === b.slug && a.date === b.date;
  if (a.mode === "transfer" && b.mode === "transfer") return a.from === b.from && a.to === b.to && a.date === b.date;
  return false;
}

function readStorage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeStorage(raw: string | null) {
  try {
    if (raw === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Storage blocked: the list just stays empty
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function parse(raw: string): RecentSearch[] {
  if (!raw) return NONE;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return NONE;
    return data.map(toSearch).filter((search) => search !== null).slice(0, LIMIT);
  } catch {
    return NONE;
  }
}

// Stored data is untrusted: keep only well-formed fields
function toSearch(value: unknown): RecentSearch | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const text = (key: string) => (typeof record[key] === "string" ? (record[key] as string) : undefined);
  const rawDate = text("date");
  const date = rawDate && DATE_PATTERN.test(rawDate) ? rawDate : undefined;
  const party = toParty(record.party);

  const slug = text("slug");
  if (record.mode === "tours" && slug) return { mode: "tours", slug, date, party };

  const from = text("from");
  const to = text("to");
  if (record.mode === "transfer" && from && to) {
    const rawTime = text("time");
    return { mode: "transfer", from, to, date, time: rawTime && TIME_PATTERN.test(rawTime) ? rawTime : undefined, party };
  }
  return null;
}

function toParty(value: unknown): Party {
  const record = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const count = (group: PartyGroup) => {
    const stored = record[group];
    return typeof stored === "number" && Number.isFinite(stored) ? clampGroup(group, stored) : defaultParty[group];
  };
  const [adults, kids, infants] = partyGroups.map(count);
  return { adults, kids, infants, luggage: record.luggage === true };
}
