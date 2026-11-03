import "server-only";

import { z } from "zod";

import { failure, type ActionResult } from "@/lib/admin/action-result";
import type { Translations } from "@/lib/content/schema";
import { translateFromIndonesian } from "@/lib/machine-translation/google";
import { fieldsToTranslate, withTranslations, type Draft, type Target, type TextFields } from "@/lib/machine-translation/plan";

export type Translated<T> =
  | { ok: true; value: Translations<T>; problem: string | null }
  | { ok: false; result: ActionResult };

const targets: Target[] = ["en", "fr"];

/**
 * Fills in a draft's English and French from its Indonesian (see plan.ts for when).
 * If translation isn't possible the save still goes ahead with what's there, and `problem` says why;
 * only English is required, because it's the language the site falls back to.
 */
export async function translateDraft<T extends TextFields>(
  draft: Draft<T>,
  previous: Translations<T> | undefined,
  complete: z.ZodType<T>,
  path: string,
): Promise<Translated<T>> {
  const filled: Draft<T> = { ...draft };
  let problem: string | null = null;

  for (const target of targets) {
    const jobs = fieldsToTranslate(draft, previous, target);
    if (jobs.length === 0) continue;
    try {
      const translations = await translateFromIndonesian(
        jobs.map((job) => job.source),
        target,
      );
      filled[target] = withTranslations(draft, target, jobs, translations);
    } catch (error) {
      problem = error instanceof Error ? error.message : "the translation service didn't answer";
    }
  }

  const english = complete.safeParse(filled.en ?? {});
  if (!english.success) {
    const fieldErrors = Object.fromEntries(
      english.error.issues.map((issue) => [[path, "en", ...issue.path.map(String)].join("."), issue.message]),
    );
    return {
      ok: false,
      result: failure(`The English is missing${problem ? ` because ${problem}` : ""}. Fill it in on the English tab, or try again.`, fieldErrors),
    };
  }

  const value = { ...filled, en: english.data } as Translations<T>;
  return { ok: true, value, problem };
}

/** translateDraft() for a single string, such as a question or a place name. */
export async function translateText(
  draft: Draft<string>,
  previous: Translations<string> | undefined,
  complete: z.ZodType<string>,
  path: string,
): Promise<Translated<string>> {
  const wrap = <V,>(text: Partial<Record<string, V>>) =>
    Object.fromEntries(Object.entries(text).map(([locale, value]) => [locale, { text: value ?? "" }]));
  const translated = await translateDraft(
    wrap(draft) as Draft<{ text: string }>,
    previous && (wrap(previous) as Translations<{ text: string }>),
    z.object({ text: complete }),
    path,
  );
  if (!translated.ok) {
    // Errors come back for "<path>.en.text"; the form's field is "<path>.en".
    const { result } = translated;
    if (result.ok || !result.fieldErrors) return { ok: false, result };
    const fieldErrors = Object.fromEntries(Object.entries(result.fieldErrors).map(([key, message]) => [key.replace(/\.text$/, ""), message]));
    return { ok: false, result: failure(result.error, fieldErrors) };
  }
  const value = Object.fromEntries(Object.entries(translated.value).map(([locale, text]) => [locale, text?.text]));
  return { ok: true, value: value as Translations<string>, problem: translated.problem };
}

/** The success message, with a note when English or French couldn't be updated. */
export function savedMessage(message: string, problems: (string | null)[]) {
  const problem = problems.find(Boolean);
  return problem ? `${message} English and French weren't updated: ${problem}.` : message;
}
