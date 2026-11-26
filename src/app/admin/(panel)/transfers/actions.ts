"use server";

import { databaseFailure, failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { savedMessage, translateText } from "@/lib/admin/auto-translate";
import { formObject } from "@/lib/admin/form-data";
import { resolveMapLocation } from "@/lib/admin/map-location";
import { contentChanged, newKey, nextPosition } from "@/lib/admin/mutations";
import { completeText, placeInput, routeInput } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { placeToRow, tables, type PlaceRow } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

/** Adds a place (originalId null; its id comes from its name) or updates the one at originalId. */
export async function savePlace(originalId: string | null, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = placeInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const { location, ...place } = parsed.data;
  const position = await resolveMapLocation(location);
  if (!position.ok) return failure("Lokasi di peta perlu diperbaiki.", { location: position.error });

  const { data: before } =
    originalId === null ? { data: null } : await supabase.from(tables.places).select("name").eq("id", originalId).maybeSingle<Pick<PlaceRow, "name">>();
  const name = await translateText(parsed.data.name, before?.name, completeText, "name");
  if (!name.ok) return name.result;
  const id = originalId ?? (await newKey(tables.places, "id", parsed.data.name.id, "tempat"));
  const row = placeToRow({ ...place, ...position.value, id, name: name.value });

  const { error } =
    originalId === null
      ? await supabase.from(tables.places).insert({ ...row, position: await nextPosition(tables.places) })
      : await supabase.from(tables.places).update(row).eq("id", originalId);
  if (error) return databaseFailure(error, "tempat");

  contentChanged(contentTags.places, contentTags.routes);
  return { ok: true, message: savedMessage(originalId === null ? "Tempat ditambahkan." : "Tempat disimpan.", [name.problem]) };
}

export async function addRoute(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = routeInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { error } = await supabase.from(tables.routes).insert({
    from_place: parsed.data.from,
    to_place: parsed.data.to,
    position: await nextPosition(tables.routes),
  });
  if (error?.code === "23505") return failure("Rute itu sudah ada di daftar.");
  if (error) return databaseFailure(error, "rute");

  contentChanged(contentTags.routes);
  return { ok: true, message: "Rute ditambahkan." };
}
