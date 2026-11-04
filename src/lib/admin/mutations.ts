import "server-only";

import { refresh, updateTag } from "next/cache";

import { requireAdmin } from "@/lib/admin/session";
import { tables } from "@/lib/content/rows";
import { isBundledPhoto, PHOTO_BUCKET } from "@/lib/photos";

// Helpers for the admin's server actions. Not server actions themselves, so the browser can't call them.

/** Expire the public site's cached copy and redraw the admin page. Call after every successful write. */
export function contentChanged(...tags: string[]) {
  for (const tag of tags) updateTag(tag);
  refresh();
}

/** The next free position, so new items go to the end of their list. */
export async function nextPosition(table: string) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from(table).select("position").order("position", { ascending: false }).limit(1);
  return ((data?.[0] as { position: number } | undefined)?.position ?? -1) + 1;
}

/** Removes a photo that's no longer used, if it was uploaded from the admin. A failure only leaves an unused file behind. */
export async function discardPhoto(photo: string | null) {
  if (!photo || isBundledPhoto(photo)) return;
  const { supabase } = await requireAdmin();
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([photo]);
  if (error) console.error(`Couldn't delete the old photo "${photo}" from storage; it can be removed by hand.`, error);
}

// The site needs at least one shown package (the home page photo and search) and one shown car with a transfer rate
// (every transfer price). These say why a change would break that, or null when it's fine.

/** Would hiding or deleting this package leave none shown? */
export async function lastShownTourProblem(slug: string): Promise<string | null> {
  const { supabase } = await requireAdmin();
  const { count } = await supabase.from(tables.tours).select("slug", { count: "exact", head: true }).eq("published", true).neq("slug", slug);
  return count === 0 ? "The website needs at least one package shown. Show another package first." : null;
}

/** Would hiding, deleting or taking transfers off this car leave no car to price transfers with? */
export async function lastTransferCarProblem(id: string): Promise<string | null> {
  const { supabase } = await requireAdmin();
  const { count } = await supabase
    .from(tables.vehicles)
    .select("id", { count: "exact", head: true })
    .eq("published", true)
    .not("transfer_base_idr", "is", null)
    .neq("id", id);
  return count === 0 ? "The website needs at least one shown car offered for transfers. Set up another car first." : null;
}
