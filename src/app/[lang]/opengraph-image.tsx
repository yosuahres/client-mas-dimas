import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import sharp from "sharp";

import { hasLocale } from "@/i18n/config";
import { getDictionaryFor } from "@/i18n/server";
import { getSite } from "@/lib/content/public";

// The card shown when a page is shared on WhatsApp, Facebook, X and the like, in each language:
// Borobudur at sunrise with the business name and the site's headline. Pages under [lang] inherit it.
export const alt = "Borobudur temple at sunrise, Yogyakarta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

// CC BY 2.0 asks for the credit wherever the photo appears, so it is printed on the card.
const photoPath = join(process.cwd(), "public/photos/borobudur.jpg");
const photoCredit = "Photo: Justine Hong / Wikimedia Commons, CC BY 2.0";

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const [t, site, photo] = await Promise.all([
    getDictionaryFor(lang).then((dictionary) => dictionary.meta),
    getSite(),
    readFile(photoPath, "base64"),
  ]);

  const card = new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", color: "white" }}>
        <img
          src={`data:image/jpeg;base64,${photo}`}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.1))",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", fontSize: 34, letterSpacing: "-0.02em" }}>{site.businessName}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, opacity: 0.85 }}>{t.city}</div>
            <div style={{ marginTop: 12, maxWidth: 1000, fontSize: 70, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
              {t.title}
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", top: 60, right: 64, fontSize: 18, opacity: 0.8 }}>{photoCredit}</div>
      </div>
    ),
    size,
  );

  // ImageResponse only draws PNG, about 1.6 MB for a photo; WhatsApp shows no preview for images that large.
  const jpeg = await sharp(Buffer.from(await card.arrayBuffer()))
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  // A day, so headline edits made in /admin/text reach the card without a rebuild.
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
  });
}
