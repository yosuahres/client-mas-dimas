// Which fields to (re)translate when the client saves. The client writes in Indonesian; a field's English or
// French is translated again when its Indonesian changed, unless someone corrected that translation by hand
// in the same save. An empty translation is always filled. Pure, so the rules are easy to test.

/** A translated text's fields: plain strings, or lists (a tour's stops) translated as one block of lines. */
export type TextFields = Record<string, string | string[]>;

/** Indonesian is required; English and French may be blank, to be filled by translation. */
export type Draft<T> = { id: T; en?: T; fr?: T };

export type Target = "en" | "fr";

export type TranslationJob = {
  field: string;
  source: string;
};

function flat(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value.join("\n") : (value ?? "")).trim();
}

export function fieldsToTranslate<T extends TextFields>(next: Draft<T>, previous: Partial<Draft<T>> | undefined, target: Target): TranslationJob[] {
  return Object.keys(next.id).flatMap((field) => {
    const source = flat(next.id[field]);
    if (!source) return [];
    const typed = flat(next[target]?.[field]);
    if (!typed) return [{ field, source }];

    const sourceChanged = flat(previous?.id?.[field]) !== source;
    const correctedByHand = flat(previous?.[target]?.[field]) !== typed;
    return sourceChanged && !correctedByHand ? [{ field, source }] : [];
  });
}

/** The target language's fields with the translations put in. */
export function withTranslations<T extends TextFields>(next: Draft<T>, target: Target, jobs: TranslationJob[], translations: string[]): T {
  const merged: TextFields = { ...(next[target] ?? {}) };
  jobs.forEach((job, index) => {
    merged[job.field] = Array.isArray(next.id[job.field])
      ? translations[index].split("\n").map((line) => line.trim()).filter(Boolean)
      : translations[index];
  });
  return merged as T;
}
