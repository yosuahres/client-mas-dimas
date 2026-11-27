"use server";

import { z } from "zod";

import { failure, type ActionResult } from "@/lib/admin/action-result";
import { contentChanged, discardPhoto, lastShownTourProblem, lastShownCarProblem } from "@/lib/admin/mutations";
import { requireAdmin } from "@/lib/admin/session";
import { tables } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

// Publish, reorder and delete, shared by every list in the admin panel.

const lists = {
  tours: { table: tables.tours, key: "slug", what: "paket", tags: [contentTags.tours] },
  vehicles: { table: tables.vehicles, key: "id", what: "mobil", tags: [contentTags.vehicles] },
  places: { table: tables.places, key: "id", what: "tempat", tags: [contentTags.places, contentTags.routes] },
  routes: { table: tables.routes, key: "id", what: "rute", tags: [contentTags.routes] },
  reviews: { table: tables.reviews, key: "id", what: "ulasan", tags: [contentTags.reviews] },
  faqs: { table: tables.faqs, key: "id", what: "pertanyaan", tags: [contentTags.faqs] },
  gallery: { table: tables.gallery, key: "id", what: "foto", tags: [contentTags.gallery] },
  articles: { table: tables.articles, key: "slug", what: "artikel", tags: [contentTags.articles] },
} as const;

export type ListName = keyof typeof lists;

// Server actions are public endpoints: the TypeScript types on their arguments aren't checked at run time,
// so a signed-in browser could send anything. These are.
const itemKey = z.string().min(1).max(100);
const itemKeys = z.array(itemKey).max(500);

function listFor(name: ListName) {
  // hasOwn: "constructor" or "__proto__" must not find something on Object.prototype.
  if (typeof name !== "string" || !Object.hasOwn(lists, name)) throw new Error("Unknown list");
  return lists[name];
}

/** Why removing this item from the website would break it, if it would. */
async function removalProblem(name: ListName, key: string) {
  if (name === "tours") return lastShownTourProblem(key);
  if (name === "vehicles") return lastShownCarProblem(key);
  return null;
}

export async function setPublished(name: ListName, key: string, published: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const list = listFor(name);
  if (!itemKey.safeParse(key).success || typeof published !== "boolean") return failure("Permintaan tidak valid.");
  const problem = published ? null : await removalProblem(name, key);
  if (problem) return failure(problem);
  const { error } = await supabase.from(list.table).update({ published }).eq(list.key, key);
  if (error) return failure(`Gagal mengubah ${list.what}: ${error.message}`);
  contentChanged(...list.tags);
  return { ok: true, message: published ? "Ditampilkan di website." : "Disembunyikan dari website." };
}

/** Saves a new order: keys from first to last. */
export async function reorder(name: ListName, keys: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const list = listFor(name);
  if (!itemKeys.safeParse(keys).success) return failure("Permintaan tidak valid.");
  const results = await Promise.all(
    keys.map((key, position) => supabase.from(list.table).update({ position }).eq(list.key, key)),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) return failure(`Gagal menyimpan urutan: ${failed.error.message}`);
  contentChanged(...list.tags);
  return { ok: true, message: "Urutan disimpan." };
}

export async function deleteItem(name: ListName, key: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const list = listFor(name);
  if (!itemKey.safeParse(key).success) return failure("Permintaan tidak valid.");
  const problem = await removalProblem(name, key);
  if (problem) return failure(problem);
  const { data, error } = await supabase.from(list.table).delete().eq(list.key, key).select();
  if (error) return failure(`Gagal menghapus ${list.what}: ${error.message}`);
  if (!data?.length) return failure(`${list.what[0].toUpperCase()}${list.what.slice(1)} ini sudah dihapus.`);

  // Uploaded photos go with their package, gallery item or article.
  if (name === "tours" || name === "gallery") await discardPhoto((data[0] as { photo: string | null }).photo);
  if (name === "articles") {
    const article = data[0] as { cover: string | null; photos: string[] };
    await Promise.all([article.cover, ...article.photos].map(discardPhoto));
  }

  contentChanged(...list.tags);
  return { ok: true, message: "Dihapus." };
}
