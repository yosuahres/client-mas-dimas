import type { Metadata } from "next";

import { FaqSection } from "@/components/landing/faq-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { PageCta } from "@/components/page-cta";
import { PageHeader } from "@/components/page-header";
import { languageAlternates } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = (await getDictionary()).faq;
  return {
    title: t.title,
    description: t.lede,
    alternates: languageAlternates(locale, "/faq"),
  };
}

export default async function Page() {
  const t = (await getDictionary()).faq;

  return (
    <>
      <SiteHeader path="/faq" />
      <main>
        <PageHeader title={t.title} lede={t.lede} />
        <FaqSection />
        <PageCta />
      </main>
      <SiteFooter />
    </>
  );
}
