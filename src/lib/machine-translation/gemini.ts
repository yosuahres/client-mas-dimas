import "server-only";

import { placeholdersOf } from "@/lib/machine-translation/html";

// Gemini (Google AI Studio): the client writes in Indonesian and the admin panel translates to English and
// French on save. An AI Studio key needs no billing or card; the free tier has per-minute and per-day request
// limits (the daily one resets at midnight Pacific time). A save is one request per language. See docs/admin.md.

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
// Keeps each answer well inside the model's output limit; the whole site is about 40,000 characters.
const MAX_BATCH_CHARACTERS = 12_000;
const RETRY_DELAY_MS = 3_000;

const languageNames = { en: "English", fr: "French" } as const;

const instructions = `You translate the website of a private car and driver company in Yogyakarta, Indonesia, from Indonesian.
You get JSON: {"target": language, "texts": [...]}. Answer with a JSON array holding the translation of each text, in the same order, one entry per text.
Rules:
- Translate only. Never add notes, explanations, quotes or extra sentences.
- Keep words in curly brackets, like {price} or {tour}, exactly as written.
- Keep line breaks: each line of a text becomes one line of its translation, same number of lines.
- Keep numbers, prices (Rp 350.000), times, phone numbers, links and email addresses as written.
- Keep names of places, temples, beaches, mountains and the company (Borobudur, Prambanan, Malioboro, Kraton, Merapi, Jogja Travel) as written. Translate ordinary words around them, e.g. "Pantai Parangtritis" becomes "Parangtritis Beach".
- Write natural, friendly website copy for foreign tourists, not word-for-word translation.`;

type Target = keyof typeof languageNames;

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string };
};

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Indonesian texts in the target language, in the same order. Throws with a readable message on failure. */
export async function translateWithGemini(texts: string[], target: Target): Promise<string[]> {
  if (texts.length === 0) return [];
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("automatic translation isn't set up yet (GEMINI_API_KEY is missing on the server)");

  const translated: string[] = [];
  for (const batch of batches(texts)) translated.push(...(await translateBatch(batch, target, apiKey)));

  const broken = texts.findIndex((text, index) => placeholdersOf(text) !== placeholdersOf(translated[index]));
  if (broken !== -1) throw new Error(`the translation lost a word in curly brackets in "${texts[broken]}"`);
  const merged = texts.findIndex((text, index) => lineCount(text) !== lineCount(translated[index]));
  if (merged !== -1) throw new Error(`the translation changed the lines of "${texts[merged].split("\n")[0]}…", try saving again`);
  return translated;
}

function batches(texts: string[]) {
  const result: string[][] = [];
  let current: string[] = [];
  let size = 0;
  for (const text of texts) {
    if (current.length > 0 && size + text.length > MAX_BATCH_CHARACTERS) {
      result.push(current);
      current = [];
      size = 0;
    }
    current.push(text);
    size += text.length;
  }
  if (current.length > 0) result.push(current);
  return result;
}

async function translateBatch(texts: string[], target: Target, apiKey: string): Promise<string[]> {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const request = () =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify({ target: languageNames[target], texts }) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: { type: "ARRAY", items: { type: "STRING" } },
        },
      }),
    });

  let response = await request();
  // The free tier answers "overloaded" or "too many requests" now and then; one retry usually gets through.
  if (response.status === 429 || response.status >= 500) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    response = await request();
  }

  const body = (await response.json().catch(() => null)) as GeminiResponse | null;
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Gemini's free limit was reached (too many saves in a minute, or the day's limit). Try again in a minute; the daily limit resets at 15:00 WIB");
    }
    throw new Error(`Gemini refused the request (${response.status}${body?.error?.message ? `: ${body.error.message}` : ""})`);
  }

  const candidate = body?.candidates?.[0];
  const answer = candidate?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!answer) {
    const reason = body?.promptFeedback?.blockReason ?? candidate?.finishReason ?? "empty answer";
    throw new Error(`Gemini didn't translate the text (${reason})`);
  }

  const translations = parseTranslations(answer);
  if (!translations || translations.length !== texts.length) {
    throw new Error("Gemini's answer didn't match the text that was sent, try saving again");
  }
  return translations.map((text) => text.replaceAll("\r\n", "\n").trim());
}

function parseTranslations(answer: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(answer);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : null;
  } catch {
    return null;
  }
}

function lineCount(text: string) {
  return text.split("\n").filter((line) => line.trim()).length;
}
