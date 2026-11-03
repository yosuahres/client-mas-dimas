// schema.org JSON-LD for search engines, rendered as <script type="application/ld+json"> in pages.
import { localePath, type Locale } from "@/i18n/config";
import type { SiteSettings } from "@/lib/site";
import { tourHref, type Tour } from "@/lib/tours";

/** JSON for a <script> tag: "<" is escaped so text from the admin panel can't close the tag. */
export function jsonLdScript(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

type HomeJsonLdInput = {
  site: SiteSettings;
  locale: Locale;
  description: string;
  catalogName: string;
  tours: Tour[];
};

/** The home page: the website, and the business as a travel agency offering its tour packages. */
export function homeJsonLd({ site, locale, description, catalogName, tours }: HomeJsonLdInput) {
  const absolute = (path: string) => new URL(path, site.siteUrl).toString();
  const homeUrl = absolute(localePath(locale));
  const businessId = absolute("/#business");
  const [featuredTour] = tours;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${homeUrl}#website`,
        url: homeUrl,
        name: site.businessName,
        description,
        inLanguage: locale,
        publisher: { "@id": businessId },
      },
      {
        "@type": "TravelAgency",
        "@id": businessId,
        name: site.businessName,
        url: homeUrl,
        description,
        ...(featuredTour?.photo && { image: absolute(featuredTour.photo) }),
        logo: absolute("/apple-icon.png"),
        telephone: `+${site.whatsappNumber}`,
        email: site.email,
        address: { "@type": "PostalAddress", streetAddress: site.address, addressCountry: "ID" },
        areaServed: [
          { "@type": "City", name: "Yogyakarta" },
          { "@type": "AdministrativeArea", name: "Java" },
        ],
        ...(site.instagramUrl && { sameAs: [site.instagramUrl] }),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: catalogName,
          itemListElement: tours.map((tour) => ({
            "@type": "Offer",
            url: absolute(tourHref(locale, tour)),
            itemOffered: {
              "@type": "TouristTrip",
              name: tour.name,
              description: tour.summary,
              ...(tour.photo && { image: absolute(tour.photo) }),
            },
            // Prices are per vehicle and start from this amount; packages quoted on request have none.
            ...(tour.priceFromIdr && {
              priceSpecification: { "@type": "PriceSpecification", minPrice: tour.priceFromIdr, priceCurrency: "IDR" },
            }),
          })),
        },
      },
    ],
  };
}
