import type { Locale } from "@/i18n/config";
import type { Translations } from "@/lib/content/schema";

function isFilled(value: unknown) {
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null;
}

/** The text in this language, or the English when it hasn't been translated. */
export function translate(text: Translations<string>, locale: Locale): string {
  const value = text[locale];
  return value !== undefined && isFilled(value) ? value : text.en;
}

/** Like translate(), field by field, so a half-translated package still shows every field. */
export function translateFields<T extends object>(text: Translations<T>, locale: Locale): T {
  const translated = text[locale];
  if (!translated) return text.en;
  const filled = Object.entries(translated).filter(([, value]) => isFilled(value));
  return { ...text.en, ...Object.fromEntries(filled) };
}
