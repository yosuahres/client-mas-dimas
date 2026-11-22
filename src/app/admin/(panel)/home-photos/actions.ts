"use server";

import { databaseFailure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { formObject } from "@/lib/admin/form-data";
import { contentChanged, discardPhoto } from "@/lib/admin/mutations";
import { homePhotosInput } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { homePhotosFromRows, tables, type HomePhotoRow } from "@/lib/content/rows";
import { homePhotoSlots } from "@/lib/content/schema";
import { contentTags } from "@/lib/content/store";

/** Saves each slot's photo; an empty slot goes back to the built-in photo. Replaced uploads are deleted from storage. */
export async function saveHomePhotos(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = homePhotosInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { data, error: readError } = await supabase.from(tables.homePhotos).select("slot, photo");
  if (readError) return databaseFailure(readError, "home page photos");
  const before = homePhotosFromRows(data as HomePhotoRow[]);

  const chosen = homePhotoSlots.flatMap((slot) => (parsed.data[slot] ? [{ slot, photo: parsed.data[slot] }] : []));
  const builtIn = homePhotoSlots.filter((slot) => !parsed.data[slot]);

  if (chosen.length > 0) {
    const { error } = await supabase.from(tables.homePhotos).upsert(chosen);
    if (error) return databaseFailure(error, "home page photos");
  }
  if (builtIn.length > 0) {
    const { error } = await supabase.from(tables.homePhotos).delete().in("slot", builtIn);
    if (error) return databaseFailure(error, "home page photos");
  }

  for (const slot of homePhotoSlots) {
    const old = before[slot];
    if (old && old !== parsed.data[slot]) await discardPhoto(old);
  }

  contentChanged(contentTags.homePhotos);
  return { ok: true, message: "Home page photos saved." };
}
