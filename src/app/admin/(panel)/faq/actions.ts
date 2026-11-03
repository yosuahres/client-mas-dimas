"use server";

import { databaseFailure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { savedMessage, translateText } from "@/lib/admin/auto-translate";
import { formObject } from "@/lib/admin/form-data";
import { contentChanged, nextPosition } from "@/lib/admin/mutations";
import { completeText, faqInput } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { faqToRow, tables, type FaqRow } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

/** Adds a question (id null) or updates one. */
export async function saveFaq(id: string | null, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = faqInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { data: before } =
    id === null ? { data: null } : await supabase.from(tables.faqs).select("question, answer").eq("id", id).maybeSingle<Pick<FaqRow, "question" | "answer">>();
  const question = await translateText(parsed.data.question, before?.question, completeText, "question");
  if (!question.ok) return question.result;
  const answer = await translateText(parsed.data.answer, before?.answer, completeText, "answer");
  if (!answer.ok) return answer.result;
  const row = faqToRow({ ...parsed.data, question: question.value, answer: answer.value });

  const { error } =
    id === null
      ? await supabase.from(tables.faqs).insert({ ...row, position: await nextPosition(tables.faqs) })
      : await supabase.from(tables.faqs).update(row).eq("id", id);
  if (error) return databaseFailure(error, "question");

  contentChanged(contentTags.faqs);
  return { ok: true, message: savedMessage(id === null ? "Question added." : "Question saved.", [question.problem, answer.problem]) };
}
