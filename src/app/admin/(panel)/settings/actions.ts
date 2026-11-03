"use server";

import { databaseFailure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { formObject } from "@/lib/admin/form-data";
import { contentChanged } from "@/lib/admin/mutations";
import { settingsInput } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { settingsToRow, tables } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = settingsInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { error } = await supabase.from(tables.settings).upsert(settingsToRow(parsed.data));
  if (error) return databaseFailure(error, "business details");

  contentChanged(contentTags.settings);
  return { ok: true, message: "Business details saved." };
}
