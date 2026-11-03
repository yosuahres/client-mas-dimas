import Link from "next/link";

import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";

// Closing nudge on the information pages, back to the tour list.
export async function PageCta() {
  const locale = await getLocale();
  const t = (await getDictionary()).pageCta;

  return (
    <section className="border-t border-sand">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-14 sm:px-8">
        <h2 className="text-3xl font-medium tracking-[-0.03em]">{t.title}</h2>
        <Link
          href={localePath(locale, "/tours")}
          className="rounded-full bg-ink px-6 py-3.5 font-medium text-white hover:bg-ink/90"
        >
          {t.button}
        </Link>
      </div>
    </section>
  );
}
