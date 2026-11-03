// Page text can be edited in /admin/text. An edit is saved as a dotted path to one string in the dictionary
// ("hero.title", "plan.facts.0.label") and laid over the file's text when the page renders.
import type { TextOverrides } from "@/lib/content/schema";

export type TextEntry = {
  key: string;
  value: string;
};

/** Every string in a dictionary, with its dotted path, in reading order. */
export function textEntries(dictionary: object, prefix = ""): TextEntry[] {
  return Object.entries(dictionary).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") return [{ key: path, value }];
    if (value && typeof value === "object") return textEntries(value, path);
    return [];
  });
}

/** A copy of the dictionary with each saved edit in place. Edits whose path no longer holds a string are ignored. */
export function applyTextOverrides<T extends object>(dictionary: T, overrides: TextOverrides): T {
  const keys = Object.keys(overrides);
  if (keys.length === 0) return dictionary;

  const copy = structuredClone(dictionary);
  for (const key of keys) {
    const parts = key.split(".");
    const last = parts.pop()!;
    let node: unknown = copy;
    for (const part of parts) {
      node = node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined;
    }
    if (node && typeof node === "object" && typeof (node as Record<string, unknown>)[last] === "string") {
      (node as Record<string, unknown>)[last] = overrides[key];
    }
  }
  return copy;
}
