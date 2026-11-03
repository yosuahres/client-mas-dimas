import { intlLocale, type Locale } from "@/i18n/config";

// Prices are stored as whole rupiah (integers). Never use floats for money.

export function formatIdr(amount: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Rough US dollar equivalent, for display next to rupiah prices. The rate is set in /admin/settings. */
export function formatApproxUsd(amountIdr: number, locale: Locale, idrPerUsd: number) {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(amountIdr / idrPerUsd));
}
