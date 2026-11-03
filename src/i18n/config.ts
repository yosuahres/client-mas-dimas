export const locales = ["en", "id", "fr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Each language written in itself, for the language switcher. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
  fr: "Français",
};

/** Intl locale used for number and currency formatting. */
export const intlLocale: Record<Locale, string> = {
  en: "en-GB",
  id: "id-ID",
  fr: "fr-FR",
};

/** Prefix an app path ("/tours") with the locale ("/fr/tours"). */
export function localePath(locale: Locale, path = "") {
  return `/${locale}${path === "/" ? "" : path}`;
}

/** Open Graph locale ("en_GB") for each language. */
export const ogLocale: Record<Locale, string> = {
  en: "en_GB",
  id: "id_ID",
  fr: "fr_FR",
};

/**
 * hreflang alternates for a page that exists in every language. x-default is the path without a language,
 * where the proxy picks one from the visitor's browser.
 */
export function languageAlternates(locale: Locale, path = "") {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localePath(l, path)])),
      "x-default": path || "/",
    },
  };
}
