"use server";

import { databaseFailure, failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { formObject } from "@/lib/admin/form-data";
import { contentChanged, lastTransferCarProblem, nextPosition } from "@/lib/admin/mutations";
import { vehicleInput } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { tables, vehicleToRow } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

/** Adds a car (originalId null) or updates the one at originalId. */
export async function saveVehicle(originalId: string | null, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = vehicleInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);
  const row = vehicleToRow(parsed.data);
  const stopsTransfers = !parsed.data.published || parsed.data.transferRate === null;
  const problem = originalId !== null && stopsTransfers ? await lastTransferCarProblem(originalId) : null;
  if (problem) return failure(problem);

  const { error } =
    originalId === null
      ? await supabase.from(tables.vehicles).insert({ ...row, position: await nextPosition(tables.vehicles) })
      : await supabase.from(tables.vehicles).update(row).eq("id", originalId);
  if (error) return databaseFailure(error, "car");

  contentChanged(contentTags.vehicles);
  return { ok: true, message: originalId === null ? "Car added." : "Car saved." };
}
