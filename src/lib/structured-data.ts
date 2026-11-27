// schema.org JSON-LD for search engines, rendered as <script type="application/ld+json"> in pages.
import { localePath, type Locale } from "@/i18n/config";
import type { SiteSettings } from "@/lib/site";
import type { Article, Faq } from "@/lib/content/public";
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
        ...(site.companyName && { legalName: site.companyName }),
        ...(site.companyName && site.companyUrl && { parentOrganization: { "@type": "Organization", name: site.companyName, url: site.companyUrl } }),
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

type TourJsonLdInput = {
  site: SiteSettings;
  locale: Locale;
  tour: Tour;
  /** Name of the packages page, for the breadcrumb trail. */
  catalogName: string;
};

/** A package page: the trip with its stops and starting price, and the breadcrumb trail back to the home page. */
export function tourJsonLd({ site, locale, tour, catalogName }: TourJsonLdInput) {
  const absolute = (path: string) => new URL(path, site.siteUrl).toString();
  const tourUrl = absolute(tourHref(locale, tour));
  const breadcrumbs = [
    { name: site.businessName, url: absolute(localePath(locale)) },
    { name: catalogName, url: absolute(localePath(locale, "/tours")) },
    { name: tour.name, url: tourUrl },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        "@id": `${tourUrl}#trip`,
        name: tour.name,
        description: tour.summary,
        url: tourUrl,
        inLanguage: locale,
        ...(tour.photo && { image: absolute(tour.photo) }),
        provider: { "@id": absolute("/#business") },
        itinerary: {
          "@type": "ItemList",
          itemListElement: tour.destinations.map((destination, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: { "@type": "TouristAttraction", name: destination },
          })),
        },
        offers: {
          "@type": "Offer",
          url: tourUrl,
          availability: "https://schema.org/InStock",
          // Prices are per vehicle and start from this amount; packages quoted on request have none.
          ...(tour.priceFromIdr && {
            priceSpecification: { "@type": "PriceSpecification", minPrice: tour.priceFromIdr, priceCurrency: "IDR" },
          }),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      },
    ],
  };
}

function breadcrumbList(crumbs: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: crumb.url })),
  };
}

type ArticleJsonLdInput = {
  site: SiteSettings;
  locale: Locale;
  article: Article;
  /** Name of the articles page, for the breadcrumb trail. */
  listName: string;
};

/** An article page: the article, published by the business, and the breadcrumb trail back to the home page. */
export function articleJsonLd({ site, locale, article, listName }: ArticleJsonLdInput) {
  const absolute = (path: string) => new URL(path, site.siteUrl).toString();
  const articleUrl = absolute(localePath(locale, `/articles/${article.slug}`));
  const business = { "@type": "Organization", "@id": absolute("/#business"), name: site.businessName, url: absolute("/") };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}#article`,
        headline: article.title,
        description: article.excerpt,
        url: articleUrl,
        mainEntityOfPage: articleUrl,
        inLanguage: locale,
        datePublished: article.publishedOn,
        ...(article.cover && { image: [article.cover, ...article.photos].map((photo) => absolute(photo)) }),
        author: business,
        publisher: business,
      },
      breadcrumbList([
        { name: site.businessName, url: absolute(localePath(locale)) },
        { name: listName, url: absolute(localePath(locale, "/articles")) },
        { name: article.title, url: articleUrl },
      ]),
    ],
  };
}

/** The Questions page, so search engines can show the answers under the result. */
export function faqJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
