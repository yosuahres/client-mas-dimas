import "server-only";

import { isGeminiConfigured, translateWithGemini } from "@/lib/machine-translation/gemini";
import { isTranslationConfigured as isGoogleConfigured, translateFromIndonesian as translateWithGoogle, type TranslationTarget } from "@/lib/machine-translation/google";

// The admin panel's translator: Gemini (no billing needed) when GEMINI_API_KEY is set, Google Cloud
// Translation when GOOGLE_TRANSLATE_API_KEY is set. With both, Google takes over when Gemini fails.

export type { TranslationTarget };

export function isTranslationConfigured() {
  return isGeminiConfigured() || isGoogleConfigured();
}

/** Indonesian texts in the target language, in the same order. Throws with a readable message on failure. */
export async function translateFromIndonesian(texts: string[], target: TranslationTarget): Promise<string[]> {
  if (texts.length === 0) return [];
  if (!isTranslationConfigured()) throw new Error("automatic translation isn't set up yet (GEMINI_API_KEY is missing on the server)");
  if (!isGeminiConfigured()) return translateWithGoogle(texts, target);
  try {
    return await translateWithGemini(texts, target);
  } catch (error) {
    if (!isGoogleConfigured()) throw error;
    return translateWithGoogle(texts, target);
  }
}
