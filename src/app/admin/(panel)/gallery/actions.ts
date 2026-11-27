"use server";

import { databaseFailure, failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { savedMessage, translateText } from "@/lib/admin/auto-translate";
import { formObject } from "@/lib/admin/form-data";
import { contentChanged, discardPhoto, nextPosition } from "@/lib/admin/mutations";
import { completeText, galleryPhotoInput, newGalleryPhotos } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { tables, type GalleryPhotoRow } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

const noCaption = { en: "", id: "", fr: "" };

/** Adds photos just uploaded from the Gallery page to the end of the gallery, shown and without captions. */
export async function addGalleryPhotos(keys: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = newGalleryPhotos.safeParse(keys);
  if (!parsed.success) return failure("Unggah fotonya sekali lagi.");

  const first = await nextPosition(tables.gallery);
  const rows = parsed.data.map((photo, index) => ({ photo, caption: noCaption, position: first + index, published: true }));
  const { error } = await supabase.from(tables.gallery).insert(rows);
  if (error) {
    await Promise.all(parsed.data.map(discardPhoto));
    return databaseFailure(error, "foto");
  }

  contentChanged(contentTags.gallery);
  return { ok: true, message: `${rows.length} foto ditambahkan ke galeri.` };
}

/** Saves a gallery photo's caption, photo and visibility. */
export async function saveGalleryPhoto(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = galleryPhotoInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { data: before } = await supabase
    .from(tables.gallery)
    .select("photo, caption")
    .eq("id", id)
    .maybeSingle<Pick<GalleryPhotoRow, "photo" | "caption">>();
  if (!before) return failure("Foto ini sudah tidak ada. Mungkin sudah dihapus di tab lain.");

  // An empty Indonesian caption clears it in every language.
  const { caption: draft } = parsed.data;
  const caption = draft.id ? await translateText(draft, before.caption, completeText, "caption") : { ok: true as const, value: noCaption, problem: null };
  if (!caption.ok) return caption.result;

  const { error } = await supabase
    .from(tables.gallery)
    .update({ photo: parsed.data.photo, caption: caption.value, published: parsed.data.published })
    .eq("id", id);
  if (error) return databaseFailure(error, "foto");
  if (before.photo !== parsed.data.photo) await discardPhoto(before.photo);

  contentChanged(contentTags.gallery);
  return { ok: true, message: savedMessage("Foto disimpan.", [caption.problem]) };
}
