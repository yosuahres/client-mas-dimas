// Business details are edited in /admin/settings and read with getSite() from @/lib/content/public.
// Translated copy lives in src/i18n.
import type { SiteSettings } from "@/lib/content/schema";

export type { SiteSettings };

export function whatsappLink(site: Pick<SiteSettings, "whatsappNumber">, message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
