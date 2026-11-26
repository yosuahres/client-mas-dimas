import "server-only";

// Places need map coordinates (to estimate distances and prices). Copying two numbers out of Google Maps is fiddly on a
// phone, so the place form takes what's easy to get there instead: the link from Share, or the numbers a long press
// shows. Short share links (maps.app.goo.gl) are followed to the full link, which holds the coordinates.

export type Coordinates = { lat: number; lng: number };
export type LocationResult = { ok: true; value: Coordinates } | { ok: false; error: string };

const NOT_A_MAP_LINK = "Ini bukan link Google Maps. Tempel link dari tombol Bagikan di Google Maps, atau angka seperti -7.7956, 110.3695.";
const NO_POSITION =
  "Link ini tidak menunjukkan titik di peta. Di Google Maps, tekan lama titik tempatnya sampai muncul pin, lalu Bagikan dan salin linknya.";
const UNREACHABLE = "Link Google Maps tidak bisa dibuka sekarang. Coba lagi, atau tempel angka posisinya, misalnya -7.7956, 110.3695.";
const OUTSIDE_INDONESIA = "Posisi ini di luar Indonesia. Periksa lagi linknya.";

const number = String.raw`(-?\d{1,3}(?:\.\d+)?)`;
const pair = String.raw`${number}\s*,\s*\+?\s*${number}`;

// Most exact first: the place's own pin, then a searched point, then the map's centre.
const linkPatterns = [
  new RegExp(String.raw`!3d${number}!4d${number}`),
  new RegExp(String.raw`[?&](?:q|query|ll|sll|center|destination|daddr)=(?:loc:)?${pair}`),
  new RegExp(String.raw`/maps/(?:search|place|dir)/(?:[^/]*/)*?${pair}`),
  new RegExp(String.raw`@${pair}`),
];

/** Coordinates in a Google Maps link, or null when it holds none (a place found by name only). */
function coordinatesInLink(link: string): Coordinates | null {
  let decoded = link;
  try {
    decoded = decodeURIComponent(link.replace(/\+/g, " "));
  } catch {
    // A stray "%" in the link: read it as it is.
  }
  for (const pattern of linkPatterns) {
    const match = decoded.match(pattern);
    if (match) return { lat: Number(match[1]), lng: Number(match[2]) };
  }
  return null;
}

function isGoogleMapsHost(host: string) {
  return (
    host === "maps.app.goo.gl" ||
    host === "goo.gl" ||
    host === "g.co" ||
    /^(?:www\.|maps\.|consent\.)?google\.(?:com|co\.id|[a-z]{2,3}|com?\.[a-z]{2})$/.test(host)
  );
}

function parseLink(text: string): URL | null {
  try {
    const url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

/** Follows a short link's redirects, staying on Google, until a link with coordinates turns up. */
async function followShortLink(start: URL): Promise<Coordinates | null> {
  let url = start;
  for (let hop = 0; hop < 5; hop += 1) {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(6000), headers: { "user-agent": "Mozilla/5.0" } });
    const next = response.headers.get("location");
    if (!next || response.status < 300 || response.status >= 400) return null;
    const found = coordinatesInLink(next);
    if (found) return found;
    url = new URL(next, url);
    if (!isGoogleMapsHost(url.hostname)) return null;
  }
  return null;
}

function checked(coordinates: Coordinates): LocationResult {
  const { lat, lng } = coordinates;
  // Every place the business drives to is in Indonesia; anything else is a wrong link or swapped numbers.
  if (!(lat >= -11.5 && lat <= 6.5 && lng >= 94.5 && lng <= 141.5)) return { ok: false, error: OUTSIDE_INDONESIA };
  return { ok: true, value: { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 } };
}

/** Turns what the client pasted (a Google Maps link, or "lat, lng") into coordinates. */
export async function resolveMapLocation(input: string): Promise<LocationResult> {
  const text = input.trim();

  const typed = text.match(new RegExp(String.raw`^${number}\s*[,\s]\s*${number}$`));
  if (typed) return checked({ lat: Number(typed[1]), lng: Number(typed[2]) });

  const url = parseLink(text);
  if (!url || !isGoogleMapsHost(url.hostname)) return { ok: false, error: NOT_A_MAP_LINK };

  const inLink = coordinatesInLink(url.href);
  if (inLink) return checked(inLink);

  const isShortLink = url.hostname === "maps.app.goo.gl" || url.hostname === "goo.gl" || url.hostname === "g.co";
  if (!isShortLink) return { ok: false, error: NO_POSITION };

  try {
    const followed = await followShortLink(url);
    return followed ? checked(followed) : { ok: false, error: NO_POSITION };
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
}
