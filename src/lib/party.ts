// Who is travelling: passengers by age group, like airline search, plus whether they bring luggage.
// Cars are priced per vehicle, so this doesn't change the price; it tells the client which car fits.
// Carried between pages in the URL (?adults=2&kids=1&infants=0&luggage=1) and sent in the WhatsApp request.

import type { Locale } from "@/i18n/config";
import { intlLocale } from "@/i18n/config";
import { fill } from "@/i18n/format";

export const partyGroups = ["adults", "kids", "infants"] as const;
export type PartyGroup = (typeof partyGroups)[number];

export type Party = Record<PartyGroup, number> & { luggage: boolean };

export const partyLimits: Record<PartyGroup, { min: number; max: number }> = {
  adults: { min: 1, max: 20 },
  kids: { min: 0, max: 20 },
  infants: { min: 0, max: 10 },
};

export const defaultParty: Party = { adults: 1, kids: 0, infants: 0, luggage: false };

export function clampGroup(group: PartyGroup, count: number) {
  const { min, max } = partyLimits[group];
  return Math.min(max, Math.max(min, Math.trunc(count)));
}

/** Read a party from URL params, falling back to the defaults for anything missing or out of range. */
export function parseParty(read: (key: string) => string | null | undefined): Party {
  const count = (group: PartyGroup) => {
    const raw = read(group);
    if (!raw || !/^\d{1,3}$/.test(raw)) return defaultParty[group];
    return clampGroup(group, Number(raw));
  };
  return { adults: count("adults"), kids: count("kids"), infants: count("infants"), luggage: read("luggage") === "1" };
}

/** Same as parseParty, for the params object a page receives. */
export function parsePartyParams(params: Record<string, string | string[] | undefined>): Party {
  return parseParty((key) => {
    const value = params[key];
    return typeof value === "string" ? value : undefined;
  });
}

/** The URL params for a party, leaving out empty groups so links stay short. */
export function partyParams(party: Party): [string, string][] {
  const entries: [string, string][] = [["adults", String(party.adults)]];
  if (party.kids > 0) entries.push(["kids", String(party.kids)]);
  if (party.infants > 0) entries.push(["infants", String(party.infants)]);
  if (party.luggage) entries.push(["luggage", "1"]);
  return entries;
}

export function partySize(party: Party) {
  return party.adults + party.kids + party.infants;
}

export type PluralForms = { one: string; other: string };

export type PartyText = {
  counts: Record<PartyGroup, PluralForms>;
  total: PluralForms;
};

export function plural(count: number, forms: PluralForms, locale: Locale) {
  const form = new Intl.PluralRules(intlLocale[locale]).select(count) === "one" ? forms.one : forms.other;
  return fill(form, { n: count });
}

/** "2 adults, 1 child" — empty groups left out. */
export function describeParty(party: Party, text: PartyText, locale: Locale) {
  return partyGroups
    .filter((group) => party[group] > 0)
    .map((group) => plural(party[group], text.counts[group], locale))
    .join(", ");
}
