// The card shown when a page is shared on WhatsApp, Facebook, X and the like: a photo with the business name
// and a headline over it. Used by the opengraph-image.tsx files under src/app/[lang].
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

import { isBundledPhoto } from "@/lib/photos";

export const shareCardSize = { width: 1200, height: 630 };
export const shareCardContentType = "image/jpeg";

/** The photo used when a page has none of its own. CC BY 2.0 asks for the credit wherever the photo appears. */
export const defaultSharePhoto = {
  src: "/photos/borobudur.jpg",
  alt: "Borobudur temple at sunrise, Yogyakarta",
  credit: "Photo: Justine Hong / Wikimedia Commons, CC BY 2.0",
};

type ShareCard = {
  businessName: string;
  /** Small line above the headline, e.g. the city or a package's duration. */
  kicker: string;
  headline: string;
  /** A path under /public or a full URL. */
  photo: string;
  /** Printed on the card when the photo's licence asks for it. */
  credit?: string;
};

async function loadPhoto(photo: string) {
  if (isBundledPhoto(photo)) return readFile(join(process.cwd(), "public", photo));
  const response = await fetch(photo);
  if (!response.ok) throw new Error(`Share card photo ${photo} answered ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function shareCardResponse({ businessName, kicker, headline, photo, credit }: ShareCard) {
  // Cropped to the card and re-encoded first: the card renderer reads JPEG and PNG only, and uploads may be WebP.
  const background = await sharp(await loadPhoto(photo))
    .resize({ ...shareCardSize, fit: "cover" })
    .jpeg({ quality: 85 })
    .toBuffer();

  const card = new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", color: "white" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- drawn into the card image, not sent to a browser */}
        <img
          src={`data:image/jpeg;base64,${background.toString("base64")}`}
          alt=""
          width={shareCardSize.width}
          height={shareCardSize.height}
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
          <div style={{ display: "flex", fontSize: 34, letterSpacing: "-0.02em" }}>{businessName}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, opacity: 0.85 }}>{kicker}</div>
            <div style={{ marginTop: 12, maxWidth: 1000, fontSize: 70, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
              {headline}
            </div>
          </div>
        </div>
        {credit ? <div style={{ position: "absolute", top: 60, right: 64, fontSize: 18, opacity: 0.8 }}>{credit}</div> : null}
      </div>
    ),
    shareCardSize,
  );

  // ImageResponse only draws PNG, about 1.6 MB for a photo; WhatsApp shows no preview for images that large.
  const jpeg = await sharp(Buffer.from(await card.arrayBuffer()))
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  // A day, so edits made in the admin panel reach the card without a rebuild.
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": shareCardContentType, "Cache-Control": "public, max-age=86400" },
  });
}
