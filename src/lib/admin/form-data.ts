// Admin forms name their fields by path ("text.fr.name", "transferRate.baseIdr"); names ending in "[]" are lists
// ("interests[]"). This turns the submitted FormData back into that nested object for zod to check.

type Nested = { [key: string]: unknown };

export function formObject(formData: FormData): Nested {
  const result: Nested = {};
  for (const [name, value] of formData.entries()) {
    // Next adds its own $ACTION_* fields to forms bound to server actions.
    if (name.startsWith("$ACTION") || typeof value !== "string") continue;

    const isList = name.endsWith("[]");
    const parts = (isList ? name.slice(0, -2) : name).split(".");
    const last = parts.pop()!;
    let node = result;
    for (const part of parts) {
      node[part] ??= {};
      node = node[part] as Nested;
    }
    if (isList) {
      node[last] = [...((node[last] as string[] | undefined) ?? []), value];
    } else {
      node[last] = value;
    }
  }
  return result;
}
