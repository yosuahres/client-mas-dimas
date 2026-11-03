import Link from "next/link";

import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";

export default async function NotFound() {
  const locale = await getLocale();
  const t = (await getDictionary()).notFound;

  return (
    <>
      <SiteHeader path="/" />
      <main className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-28 sm:px-8">
          <h1 className="text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] font-medium tracking-[-0.03em]">
            {t.title}
          </h1>
          <p className="mt-5 max-w-xl text-lede text-white/85">{t.body}</p>
          <Link
            href={localePath(locale, "/tours")}
            className="mt-9 inline-block rounded-full bg-white px-6 py-3.5 font-medium text-ink hover:bg-white/90"
          >
            {t.cta}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
