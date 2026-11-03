import type { Metadata } from "next";
import { Geist, Manrope, Noto_Sans_Javanese } from "next/font/google";

import { WhatsappIcon } from "@/components/icons";
import { languageAlternates, locales, ogLocale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { getSite } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";
import "../globals.css";

// Free stand-ins for the fonts on sunday.ai: Geist for Basel Grotesk, Manrope for Styrene B.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin", "latin-ext"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
});

// Used once, for the city name in aksara Jawa, as on Jogja's street signs.
const notoJavanese = Noto_Sans_Javanese({
  variable: "--font-noto-javanese",
  subsets: ["javanese"],
  weight: ["400"],
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Pages set a plain title and their own description and alternates. Open Graph and Twitter cards are left
// here without a title or description, so Next.js fills them from each page's; the share image is
// opengraph-image.tsx in this folder.
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = (await getDictionary()).meta;
  const site = await getSite();
  return {
    metadataBase: new URL(site.siteUrl),
    title: {
      default: `${t.title} | ${site.businessName}`,
      template: `%s | ${site.businessName}`,
    },
    description: t.description,
    applicationName: site.businessName,
    category: "travel",
    alternates: languageAlternates(locale),
    openGraph: {
      type: "website",
      siteName: site.businessName,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
    },
    twitter: { card: "summary_large_image" },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    ...(process.env.GOOGLE_SITE_VERIFICATION && {
      verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
    }),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const t = (await getDictionary()).header;
  const site = await getSite();

  return (
    <html lang={locale} data-scroll-behavior="smooth" className={`${geist.variable} ${manrope.variable} ${notoJavanese.variable}`}>
      <body className="min-h-full">
        {children}

        {/* Always-reachable WhatsApp on phones, where most guests plan their trip */}
        <a
          href={whatsappLink(site, t.chatMessage)}
          aria-label={t.chat}
          className="fixed right-4 bottom-4 z-30 grid size-14 place-items-center rounded-full bg-jade text-white shadow-lg shadow-ink/20 sm:hidden"
        >
          <WhatsappIcon className="size-6" />
        </a>
      </body>
    </html>
  );
}
