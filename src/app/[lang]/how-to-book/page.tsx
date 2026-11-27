import type { Metadata } from "next";

import { HowBookingWorks } from "@/components/landing/how-booking-works";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { PageHeader } from "@/components/page-header";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).booking;
  return pageMetadata("/how-to-book", t.title, t.metaDescription);
}

export default async function Page() {
  const t = (await getDictionary()).booking;

  return (
    <>
      <SiteHeader path="/how-to-book" />
      <main>
        <PageHeader title={t.title} look="ink" />
        <HowBookingWorks />
      </main>
      <SiteFooter />
    </>
  );
}
