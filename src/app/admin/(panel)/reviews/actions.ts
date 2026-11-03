"use server";

import { databaseFailure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { savedMessage, translateText } from "@/lib/admin/auto-translate";
import { formObject } from "@/lib/admin/form-data";
import { contentChanged, nextPosition } from "@/lib/admin/mutations";
import { completeText, reviewInput } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { reviewToRow, tables, type ReviewRow } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

/** Adds a review (id null) or updates one. */
export async function saveReview(id: string | null, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = reviewInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { data: before } =
    id === null ? { data: null } : await supabase.from(tables.reviews).select("origin, quote").eq("id", id).maybeSingle<Pick<ReviewRow, "origin" | "quote">>();
  const origin = await translateText(parsed.data.origin, before?.origin, completeText, "origin");
  if (!origin.ok) return origin.result;
  const quote = await translateText(parsed.data.quote, before?.quote, completeText, "quote");
  if (!quote.ok) return quote.result;
  const row = reviewToRow({ ...parsed.data, origin: origin.value, quote: quote.value });

  const { error } =
    id === null
      ? await supabase.from(tables.reviews).insert({ ...row, position: await nextPosition(tables.reviews) })
      : await supabase.from(tables.reviews).update(row).eq("id", id);
  if (error) return databaseFailure(error, "review");

  contentChanged(contentTags.reviews);
  return { ok: true, message: savedMessage(id === null ? "Review added." : "Review saved.", [origin.problem, quote.problem]) };
}
