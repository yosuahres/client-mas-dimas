"use server";

import { failure, type ActionResult } from "@/lib/admin/action-result";
import { contentChanged, discardPhoto, lastShownTourProblem, lastTransferCarProblem } from "@/lib/admin/mutations";
import { requireAdmin } from "@/lib/admin/session";
import { tables } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

// Publish, reorder and delete, shared by every list in the admin panel.

const lists = {
  tours: { table: tables.tours, key: "slug", what: "package", tags: [contentTags.tours] },
  vehicles: { table: tables.vehicles, key: "id", what: "car", tags: [contentTags.vehicles] },
  places: { table: tables.places, key: "id", what: "place", tags: [contentTags.places, contentTags.routes] },
  routes: { table: tables.routes, key: "id", what: "route", tags: [contentTags.routes] },
  reviews: { table: tables.reviews, key: "id", what: "review", tags: [contentTags.reviews] },
  faqs: { table: tables.faqs, key: "id", what: "question", tags: [contentTags.faqs] },
} as const;

export type ListName = keyof typeof lists;

function listFor(name: ListName) {
  const list = lists[name];
  if (!list) throw new Error(`Unknown list "${name}"`);
  return list;
}

/** Why removing this item from the website would break it, if it would. */
async function removalProblem(name: ListName, key: string) {
  if (name === "tours") return lastShownTourProblem(key);
  if (name === "vehicles") return lastTransferCarProblem(key);
  return null;
}

export async function setPublished(name: ListName, key: string, published: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const list = listFor(name);
  const problem = published ? null : await removalProblem(name, key);
  if (problem) return failure(problem);
  const { error } = await supabase.from(list.table).update({ published }).eq(list.key, key);
  if (error) return failure(`Couldn't update the ${list.what}: ${error.message}`);
  contentChanged(...list.tags);
  return { ok: true, message: published ? "Shown on the website." : "Hidden from the website." };
}

/** Saves a new order: keys from first to last. */
export async function reorder(name: ListName, keys: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const list = listFor(name);
  const results = await Promise.all(
    keys.map((key, position) => supabase.from(list.table).update({ position }).eq(list.key, key)),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) return failure(`Couldn't save the order: ${failed.error.message}`);
  contentChanged(...list.tags);
  return { ok: true, message: "Order saved." };
}

export async function deleteItem(name: ListName, key: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const list = listFor(name);
  const problem = await removalProblem(name, key);
  if (problem) return failure(problem);
  const { data, error } = await supabase.from(list.table).delete().eq(list.key, key).select();
  if (error) return failure(`Couldn't delete the ${list.what}: ${error.message}`);
  if (!data?.length) return failure(`That ${list.what} was already deleted.`);

  // An uploaded package photo goes with its package.
  if (name === "tours") await discardPhoto((data[0] as { photo: string | null }).photo);

  contentChanged(...list.tags);
  return { ok: true, message: "Deleted." };
}
