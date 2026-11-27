// Admin forms name their fields by path ("text.fr.name", "carPrices.avanza"); names ending in "[]" are lists
// ("interests[]"). This turns the submitted FormData back into that nested object for zod to check.

type Nested = { [key: string]: unknown };

// Path parts that would reach Object.prototype instead of a field ("__proto__.isAdmin" would set it on every object).
const UNSAFE_PARTS = new Set(["__proto__", "prototype", "constructor"]);

// No prototype, so a field can never collide with an inherited property.
const emptyNode = (): Nested => Object.create(null);

export function formObject(formData: FormData): Nested {
  const result = emptyNode();
  for (const [name, value] of formData.entries()) {
    // Next adds its own $ACTION_* fields to forms bound to server actions.
    if (name.startsWith("$ACTION") || typeof value !== "string") continue;

    const isList = name.endsWith("[]");
    const parts = (isList ? name.slice(0, -2) : name).split(".");
    if (parts.some((part) => UNSAFE_PARTS.has(part))) continue;
    const last = parts.pop()!;
    let node = result;
    let blocked = false;
    for (const part of parts) {
      node[part] ??= emptyNode();
      const next = node[part];
      // "name" then "name.first": don't walk into a string or a list.
      if (typeof next !== "object" || next === null || Array.isArray(next)) {
        blocked = true;
        break;
      }
      node = next as Nested;
    }
    if (blocked) continue;
    if (isList) {
      const existing = node[last];
      node[last] = [...(Array.isArray(existing) ? (existing as string[]) : []), value];
    } else {
      node[last] = value;
    }
  }
  return result;
}
