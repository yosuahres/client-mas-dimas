import "server-only";

import { fromTranslatedHtml, placeholdersOf, toTranslatableHtml } from "@/lib/machine-translation/html";

// Google Cloud Translation (Basic, v2): the client writes in Indonesian and the admin panel translates
// to English and French on save. The first 500,000 characters a month are free; see docs/admin.md for
// the daily quota that keeps it inside that.

const ENDPOINT = "https://translation.googleapis.com/language/translate/v2";
// Google accepts up to 128 texts per request.
const BATCH_SIZE = 100;

export type TranslationTarget = "en" | "fr";

export function isTranslationConfigured() {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY);
}

/** Indonesian texts in the target language, in the same order. Throws with a readable message on failure. */
export async function translateFromIndonesian(texts: string[], target: TranslationTarget): Promise<string[]> {
  if (texts.length === 0) return [];
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error("automatic translation isn't set up yet (GOOGLE_TRANSLATE_API_KEY is missing on the server)");

  const translated: string[] = [];
  for (let start = 0; start < texts.length; start += BATCH_SIZE) {
    const batch = texts.slice(start, start + BATCH_SIZE);
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ q: batch.map(toTranslatableHtml), source: "id", target, format: "html" }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      throw new Error(`Google Translate refused the request (${response.status}${body?.error?.message ? `: ${body.error.message}` : ""})`);
    }
    const { data } = (await response.json()) as { data: { translations: { translatedText: string }[] } };
    translated.push(...data.translations.map((translation) => fromTranslatedHtml(translation.translatedText)));
  }

  const broken = texts.findIndex((text, index) => placeholdersOf(text) !== placeholdersOf(translated[index]));
  if (broken !== -1) throw new Error(`the translation lost a word in curly brackets in "${texts[broken]}"`);
  return translated;
}
