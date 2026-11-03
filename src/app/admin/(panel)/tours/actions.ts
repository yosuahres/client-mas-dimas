"use server";

import { redirect } from "next/navigation";

import { databaseFailure, failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { savedMessage, translateDraft } from "@/lib/admin/auto-translate";
import { formObject } from "@/lib/admin/form-data";
import { contentChanged, discardPhoto, lastShownTourProblem, nextPosition } from "@/lib/admin/mutations";
import { completeTourText, tourInput } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { tables, tourToRow, type TourRow } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

/** Creates a package (originalSlug null) or updates the one at originalSlug, which may get a new slug. */
export async function saveTour(originalSlug: string | null, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = tourInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { data: before } =
    originalSlug === null
      ? { data: null }
      : await supabase.from(tables.tours).select("photo, text").eq("slug", originalSlug).maybeSingle<Pick<TourRow, "photo" | "text">>();
  if (originalSlug !== null && !before) return failure("This package no longer exists. It may have been deleted in another tab.");

  const text = await translateDraft(parsed.data.text, before?.text, completeTourText, "text");
  if (!text.ok) return text.result;
  const tour = { ...parsed.data, text: text.value };

  if (originalSlug === null || !before) {
    const position = await nextPosition(tables.tours);
    const { error } = await supabase.from(tables.tours).insert({ ...tourToRow(tour), position });
    if (error) return databaseFailure(error, "package");
  } else {
    const problem = tour.published ? null : await lastShownTourProblem(originalSlug);
    if (problem) return failure(problem);

    const { error } = await supabase.from(tables.tours).update(tourToRow(tour)).eq("slug", originalSlug);
    if (error) return databaseFailure(error, "package");
    if (before.photo !== tour.photo) await discardPhoto(before.photo);
  }

  // Reviews show the package name, so they change too.
  contentChanged(contentTags.tours, contentTags.reviews);
  if (originalSlug !== tour.slug) redirect(`/admin/tours/${tour.slug}`);
  return { ok: true, message: savedMessage("Package saved.", [text.problem]) };
}
