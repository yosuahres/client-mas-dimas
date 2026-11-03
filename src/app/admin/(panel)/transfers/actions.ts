"use server";

import { databaseFailure, failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { savedMessage, translateText } from "@/lib/admin/auto-translate";
import { formObject } from "@/lib/admin/form-data";
import { contentChanged, nextPosition } from "@/lib/admin/mutations";
import { completeText, placeInput, routeInput } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { placeToRow, tables, type PlaceRow } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

/** Adds a place (originalId null) or updates the one at originalId. Renaming the id carries over to its routes. */
export async function savePlace(originalId: string | null, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = placeInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { data: before } =
    originalId === null ? { data: null } : await supabase.from(tables.places).select("name").eq("id", originalId).maybeSingle<Pick<PlaceRow, "name">>();
  const name = await translateText(parsed.data.name, before?.name, completeText, "name");
  if (!name.ok) return name.result;
  const row = placeToRow({ ...parsed.data, name: name.value });

  const { error } =
    originalId === null
      ? await supabase.from(tables.places).insert({ ...row, position: await nextPosition(tables.places) })
      : await supabase.from(tables.places).update(row).eq("id", originalId);
  if (error) return databaseFailure(error, "place");

  contentChanged(contentTags.places, contentTags.routes);
  return { ok: true, message: savedMessage(originalId === null ? "Place added." : "Place saved.", [name.problem]) };
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
  if (error?.code === "23505") return failure("That route is already in the list.");
  if (error) return databaseFailure(error, "route");

  contentChanged(contentTags.routes);
  return { ok: true, message: "Route added." };
}
