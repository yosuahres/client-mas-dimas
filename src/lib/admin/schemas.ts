// What the admin forms may save. Field paths match the input names, so errors land under the right field.
import { z } from "zod";

import { placeKinds, tourInterests, tourLengths } from "@/lib/content/schema";
import type { Draft } from "@/lib/machine-translation/plan";

export const slug = z
  .string()
  .trim()
  .min(1, "Required.")
  .max(80, "Keep it under 80 characters.")
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes, e.g. borobudur-sunrise.");

const required = z.string().trim().min(1, "Required.");

/** Rupiah typed as "550000", "550.000" or "Rp 550,000". */
const rupiah = z.preprocess(
  (value) => (typeof value === "string" ? value.replace(/\D/g, "") : value),
  z
    .string()
    .min(1, "Required.")
    .transform(Number)
    .pipe(z.number().int().min(0, "Can't be negative.").max(1_000_000_000, "That's too much.")),
);

const positiveRupiah = rupiah.pipe(z.number().min(1, "Must be more than 0."));

const coordinate = (min: number, max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim().replace(",", ".") : value),
    z
      .string()
      .min(1, "Required.")
      .transform(Number)
      .pipe(z.number("Enter a number, e.g. -7.7956.").min(min, `Between ${min} and ${max}.`).max(max, `Between ${min} and ${max}.`)),
  );

/** An unchecked checkbox sends nothing; a checked one sends "on". */
const checkbox = z.preprocess((value) => value === "on" || value === "true", z.boolean());

/** Lines of a textarea, blank lines dropped. */
const lines = z.preprocess(
  (value) => (typeof value === "string" ? value.split("\n").map((line) => line.trim()).filter(Boolean) : value),
  z.array(z.string()),
);

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
  destinations: lines.pipe(z.array(z.string()).min(1, "Add at least one stop, one per line.")),
  photoAlt: optionalText,
});

const optionalTourText = z.object({
  name: optionalText,
  summary: optionalText,
  duration: optionalText,
  destinations: lines,
  photoAlt: optionalText,
});

export const tourInput = z
  .object({
    slug,
    code: z.string().trim().min(1, "Required.").max(4, "Up to 4 characters, e.g. A or P2."),
    length: z.enum(tourLengths, "Choose day trip or multi-day."),
    interests: z.array(z.enum(tourInterests)).optional().default([]),
    onRequest: checkbox,
    priceFromIdr: z.string().optional(),
    photo: z.string().trim().optional().default(""),
    credit: z
      .object({ subject: optionalText, author: optionalText, license: optionalText, source: optionalText })
      .optional(),
    text: draftTranslations(completeTourText, optionalTourText),
    published: checkbox,
  })
  .transform((input, context) => {
    let priceFromIdr: number | null = null;
    if (!input.onRequest) {
      const price = positiveRupiah.safeParse(input.priceFromIdr ?? "");
      if (!price.success) {
        context.addIssue({ code: "custom", path: ["priceFromIdr"], message: price.error.issues[0].message });
        return z.NEVER;
      }
      priceFromIdr = price.data;
    }
    const credit = input.credit;
    return {
      slug: input.slug,
      code: input.code.toUpperCase(),
      length: input.length,
      interests: input.interests,
      priceFromIdr,
      photo: input.photo || null,
      photoCredit: credit?.author ? { subject: credit.subject || input.text.id.name, author: credit.author, license: credit.license, source: credit.source } : null,
      text: input.text,
      published: input.published,
    };
  });

export const vehicleInput = z
  .object({
    id: slug,
    name: required,
    seats: required,
    maxPassengers: z.coerce.number().int("Whole number.").min(1, "At least 1.").max(60, "Up to 60."),
    dayWithDriverIdr: positiveRupiah,
    dayWithDriverAndFuelIdr: positiveRupiah,
    offersTransfers: checkbox,
    transferRate: z.object({ baseIdr: z.string(), perKmIdr: z.string(), minimumIdr: z.string() }).partial().optional(),
    published: checkbox,
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
  id: slug,
  kind: z.enum(placeKinds, "Choose a group."),
  lat: coordinate(-90, 90),
  lng: coordinate(-180, 180),
  name: translatedText,
  published: checkbox,
});

export const routeInput = z
  .object({ from: required, to: required })
  .refine((route) => route.from !== route.to, { path: ["to"], message: "Choose two different places." });

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
  siteUrl: z.url("Enter the full address, starting with https://"),
  whatsappNumber: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().regex(/^62\d{7,13}$/, "Use the international format without +, starting with 62, e.g. 628112653767.")),
  phoneDisplay: required,
  email: z.email("Enter a valid email address."),
  address: required,
  googleRating: z
    .string()
    .trim()
    .regex(/^[0-5](\.\d)?$/, "A number from 0 to 5, e.g. 4.9."),
  googleReviewsUrl: z.url("Enter the full link, starting with https://"),
  instagramUrl: z.url("Enter the full link, starting with https://"),
  idrPerUsd: positiveRupiah,
});
