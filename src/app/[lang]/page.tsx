import { FirstStepSection } from "@/components/landing/first-step-section";
import { GuidesSection } from "@/components/landing/guides-section";
import { Hero } from "@/components/landing/hero";
import { ReviewsSection } from "@/components/landing/reviews-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { ToursSection } from "@/components/landing/tours-section";
import { TransfersFeature } from "@/components/landing/transfers-feature";
import { getDictionary, getLocale } from "@/i18n/server";
import { getSite, getTours } from "@/lib/content/public";
import { homeJsonLd, jsonLdScript } from "@/lib/structured-data";

// Laid out after lonelyplanet.com: photo hero with a tilted card, a cobalt band, a card carousel,
// a full-bleed photo feature, four photo tiles on stone, a split feature, testimonials, then the footer.
// Title, description and share image come from the [lang] layout.
export default async function Home() {
  const locale = await getLocale();
  const dict = await getDictionary();
  const [site, tours] = await Promise.all([getSite(), getTours(locale)]);
  const jsonLd = homeJsonLd({
    site,
    locale,
    description: dict.meta.description,
    catalogName: dict.toursPage.title,
    tours,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <SiteHeader path="/" />
      <main>
        <Hero />
        <ToursSection />
        <GuidesSection />
        <FirstStepSection />
        <TransfersFeature />
        <ReviewsSection />
      </main>
      <SiteFooter />
    </>
  );
}
