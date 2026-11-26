// What the admin forms may save. Field paths match the input names, so errors land under the right field.
import { z } from "zod";

import { homePhotoSlots, placeKinds, seatClasses, tourInterests, tourLengths, type HomePhotoSlot } from "@/lib/content/schema";
import type { Draft } from "@/lib/machine-translation/plan";

/** A web link. z.url() alone also accepts "javascript:" and "data:", which must never reach an href. */
const webUrl = (message: string) => z.httpUrl(message);

/** A photo bundled with the site ("/photos/borobudur.jpg") or one uploaded from the admin ("tours/<uuid>.webp"). */
const photo = z
  .string()
  .trim()
  .regex(/^(\/photos\/[A-Za-z0-9][A-Za-z0-9._-]*|tours\/[0-9a-f-]{36}\.webp)$/, "Unggah fotonya sekali lagi.")
  .or(z.literal(""));

const required = z.string().trim().min(1, "Wajib diisi.");

/** Rupiah typed as "550000", "550.000" or "Rp 550,000". */
const rupiah = z.preprocess(
  (value) => (typeof value === "string" ? value.replace(/\D/g, "") : value),
  z
    .string()
    .min(1, "Wajib diisi.")
    .transform(Number)
    .pipe(z.number().int().min(0, "Tidak boleh minus.").max(1_000_000_000, "Angkanya terlalu besar.")),
);

const positiveRupiah = rupiah.pipe(z.number().min(1, "Harus lebih dari 0."));

/** A price field left empty (or with no digits in it) means the price is on request. */
const hasDigits = (value: string | undefined): value is string => /\d/.test(value ?? "");

/** An unchecked checkbox sends nothing; a checked one sends "on". */
const checkbox = z.preprocess((value) => value === "on" || value === "true", z.boolean());

/** Lines of a textarea, blank lines dropped. */
const lines = z.preprocess(
  (value) => (typeof value === "string" ? value.split("\n").map((line) => line.trim()).filter(Boolean) : value),
  z.array(z.string()),
);

/**
 * A package's split options: rows in the Package section for Indonesian ("text.id.parts[]", blanks kept so
 * each name stays next to its price), a textarea of lines for English and French. None sent: not split.
 */
const partNames = z.preprocess((value) => {
  if (value === undefined) return [];
  if (typeof value === "string") return value.split("\n").map((line) => line.trim()).filter(Boolean);
  if (Array.isArray(value)) return value.map((line) => (typeof line === "string" ? line.trim() : line));
  return value;
}, z.array(z.string()));

/**
 * The client writes in Indonesian, so it's required. English and French may be left empty: the save action
 * translates them (src/lib/admin/auto-translate.ts), and then checks the English against the "complete" schema.
 */
function draftTranslations<T>(indonesian: z.ZodType<T>, other: z.ZodType<T>) {
  return z
    .object({ id: indonesian, en: other.optional(), fr: other.optional() })
    .transform(({ id, en, fr }) => {
      const result: Draft<T> = { id };
      if (en !== undefined && !isBlank(en)) result.en = en;
      if (fr !== undefined && !isBlank(fr)) result.fr = fr;
      return result;
    });
}

function isBlank(value: unknown): boolean {
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (value && typeof value === "object") return Object.values(value).every(isBlank);
  return value === undefined || value === null;
}

const optionalText = z.string().trim().optional().default("");

/** What a translated text must have in English once translated. */
export const completeText = required;

export const translatedText = draftTranslations(required, optionalText);

export const completeTourText = z.object({
  name: required,
  summary: required,
  duration: required,
  destinations: lines.pipe(z.array(z.string()).min(1, "Isi minimal satu tujuan, satu per baris.")),
  dropOffs: lines,
  parts: partNames,
  photoAlt: optionalText,
});

const optionalTourText = z.object({
  name: optionalText,
  summary: optionalText,
  duration: optionalText,
  destinations: lines,
  dropOffs: lines,
  parts: partNames,
  photoAlt: optionalText,
});

export const tourInput = z
  .object({
    code: z.string().trim().min(1, "Wajib diisi.").max(4, "Maksimal 4 karakter, misalnya A atau P2."),
    length: z.enum(tourLengths, "Pilih perjalanan sehari atau beberapa hari."),
    interests: z.array(z.enum(tourInterests)).optional().default([]),
    // An empty price shows "Hubungi kami" (contact us) instead.
    priceFromIdr: z.string().optional(),
    accommodationOffered: checkbox,
    accommodationPriceFromIdr: z.string().optional(),
    partPrices: z.array(z.string()).optional().default([]),
    photo: photo.optional().default(""),
    credit: z
      .object({ subject: optionalText, author: optionalText, license: optionalText, source: optionalText })
      .optional(),
    text: draftTranslations(completeTourText, optionalTourText),
    published: checkbox,
  })
  .transform((input, context) => {
    let priceFromIdr: number | null = null;
    if (hasDigits(input.priceFromIdr)) {
      const price = positiveRupiah.safeParse(input.priceFromIdr);
      if (!price.success) {
        context.addIssue({ code: "custom", path: ["priceFromIdr"], message: price.error.issues[0].message });
        return z.NEVER;
      }
      priceFromIdr = price.data;
    }
    let accommodationPriceFromIdr: number | null = null;
    if (input.accommodationOffered && hasDigits(input.accommodationPriceFromIdr)) {
      const price = positiveRupiah.safeParse(input.accommodationPriceFromIdr);
      if (!price.success) {
        context.addIssue({ code: "custom", path: ["accommodationPriceFromIdr"], message: price.error.issues[0].message });
        return z.NEVER;
      }
      accommodationPriceFromIdr = price.data;
    }
    // Split options: drop rows left without a name, and keep each price next to its name. Empty price: on request.
    const names = input.text.id.parts;
    const kept = names.flatMap((name, index) => (name ? [index] : []));
    const partPrices: (number | null)[] = [];
    for (const index of kept) {
      const typed = (input.partPrices[index] ?? "").replace(/\D/g, "");
      if (!typed) {
        partPrices.push(null);
        continue;
      }
      const price = positiveRupiah.safeParse(typed);
      if (!price.success) {
        context.addIssue({ code: "custom", path: ["partPrices", String(index)], message: price.error.issues[0].message });
        return z.NEVER;
      }
      partPrices.push(price.data);
    }
    const text = { ...input.text, id: { ...input.text.id, parts: kept.map((index) => names[index]) } };
    const credit = input.credit;
    return {
      code: input.code.toUpperCase(),
      length: input.length,
      interests: input.interests,
      priceFromIdr,
      accommodationOffered: input.accommodationOffered,
      accommodationPriceFromIdr,
      partPrices,
      photo: input.photo || null,
      photoCredit: credit?.author ? { subject: credit.subject || input.text.id.name, author: credit.author, license: credit.license, source: credit.source } : null,
      text,
      published: input.published,
    };
  });

export const vehicleInput = z
  .object({
    name: required,
    seatClass: z.enum(seatClasses, "Pilih kelompok kursi."),
    seats: required,
    maxPassengers: z.coerce.number().int("Harus bilangan bulat.").min(1, "Minimal 1.").max(60, "Maksimal 60."),
    maxPassengersWithLuggage: z.coerce.number().int("Harus bilangan bulat.").min(1, "Minimal 1.").max(60, "Maksimal 60."),
    tourPricePercent: z.coerce.number().int("Harus bilangan bulat.").min(50, "Minimal 50.").max(1000, "Maksimal 1000."),
    dayWithDriverIdr: positiveRupiah,
    dayWithDriverAndFuelIdr: positiveRupiah,
    offersTransfers: checkbox,
    transferRate: z.object({ baseIdr: z.string(), perKmIdr: z.string(), minimumIdr: z.string() }).partial().optional(),
    published: checkbox,
  })
  .refine((input) => input.maxPassengersWithLuggage <= input.maxPassengers, {
    path: ["maxPassengersWithLuggage"],
    message: "Tidak boleh lebih dari jumlah tanpa bagasi.",
  })
  .transform((input, context) => {
    const { offersTransfers, transferRate, ...vehicle } = input;
    if (!offersTransfers) return { ...vehicle, transferRate: null };
    const rate = z
      .object({ baseIdr: rupiah, perKmIdr: positiveRupiah, minimumIdr: rupiah })
      .safeParse(transferRate ?? {});
    if (!rate.success) {
      for (const issue of rate.error.issues) {
        context.addIssue({ code: "custom", path: ["transferRate", ...issue.path.map(String)], message: issue.message });
      }
      return z.NEVER;
    }
    return { ...vehicle, transferRate: rate.data };
  });

export const placeInput = z.object({
  kind: z.enum(placeKinds, "Pilih kelompok."),
  /** A Google Maps link or "lat, lng"; the save action turns it into coordinates (src/lib/admin/map-location.ts). */
  location: z.string().trim().min(1, "Tempel link Google Maps tempat ini."),
  name: translatedText,
  published: checkbox,
});

export const routeInput = z
  .object({ from: required, to: required })
  .refine((route) => route.from !== route.to, { path: ["to"], message: "Pilih dua tempat yang berbeda." });

export const reviewInput = z.object({
  guestName: required,
  origin: translatedText,
  quote: translatedText,
  // The tour picker sends "none" for a review not tied to a package.
  tourSlug: z
    .string()
    .optional()
    .transform((value) => (value && value !== "none" ? value : null)),
  published: checkbox,
});

export const faqInput = z.object({
  question: translatedText,
  answer: translatedText,
  published: checkbox,
});

export const settingsInput = z.object({
  businessName: required,
  siteUrl: webUrl("Isi alamat lengkap, diawali https://"),
  whatsappNumber: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().regex(/^62\d{7,13}$/, "Pakai format internasional tanpa +, diawali 62, misalnya 628112653767.")),
  phoneDisplay: required,
  email: z.email("Isi alamat email yang benar."),
  address: required,
  googleRating: z
    .string()
    .trim()
    .regex(/^[0-5](\.\d)?$/, "Angka 0 sampai 5, misalnya 4.9."),
  googleReviewsUrl: webUrl("Isi link lengkap, diawali https://"),
  instagramUrl: webUrl("Isi link lengkap, diawali https://"),
  idrPerUsd: positiveRupiah,
});

/** A photo uploaded on the Home page photos page ("home/<uuid>.webp"); empty puts the built-in photo back. */
const homePhoto = z
  .string()
  .trim()
  .regex(/^home\/[0-9a-f-]{36}\.webp$/, "Unggah fotonya sekali lagi.")
  .or(z.literal(""))
  .optional()
  .default("");

export const homePhotosInput = z.object(
  Object.fromEntries(homePhotoSlots.map((slot) => [slot, homePhoto])) as Record<HomePhotoSlot, typeof homePhoto>,
);
