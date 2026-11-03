import type { MetadataRoute } from "next";

import { getSite } from "@/lib/content/public";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin" },
    sitemap: new URL("/sitemap.xml", site.siteUrl).toString(),
  };
}
