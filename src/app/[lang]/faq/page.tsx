import type { Metadata } from "next";

import { FaqSection } from "@/components/landing/faq-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { PageHeader } from "@/components/page-header";
import { getDictionary, getLocale } from "@/i18n/server";
import { getFaqs } from "@/lib/content/public";
import { pageMetadata } from "@/lib/page-metadata";
import { faqJsonLd, jsonLdScript } from "@/lib/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).faq;
  return pageMetadata("/faq", t.title, t.metaDescription);
}

export default async function Page() {
  const t = (await getDictionary()).faq;
  const faqs = await getFaqs(await getLocale());

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd(faqs)) }} />
      <SiteHeader path="/faq" />
      <main>
        <PageHeader title={t.title} look="wheat" centered />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
