"use server";

import { textSections } from "@/app/admin/(panel)/text/sections";
import { failure, type ActionResult } from "@/lib/admin/action-result";
import { savedMessage } from "@/lib/admin/auto-translate";
import { contentChanged } from "@/lib/admin/mutations";
import { requireAdmin } from "@/lib/admin/session";
import { hasLocale } from "@/i18n/config";
import { dictionaries } from "@/i18n/server";
import { textEntries } from "@/i18n/text-paths";
import { tables } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";
import { translateFromIndonesian, type TranslationTarget } from "@/lib/machine-translation";
import { placeholdersOf } from "@/lib/machine-translation/html";

const FIELD_PREFIX = "text:";
const TRANSLATED: TranslationTarget[] = ["en", "fr"];

type TextRow = { locale: string; key: string; value: string };

/**
 * Saves the changed page text in one language (the form sends only the fields that changed, from any
 * section). A field reset to the file's text removes the saved edit, so later changes to the file show through.
 *
 * The client writes in Indonesian: an Indonesian field that changed is translated into English and French
 * too, and one reset to the original also resets its English and French.
 */
export async function saveText(locale: string, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!hasLocale(locale)) return failure("Bahasa tidak dikenal.");
  const sections = new Set<string>(textSections.map((section) => section.key));

  const original = new Map(textEntries((await dictionaries[locale]()) as object).map((entry) => [entry.key, entry.value]));
  const upserts: TextRow[] = [];
  const removals: string[] = [];
  const fieldErrors: Record<string, string> = {};

  for (const [name, raw] of formData.entries()) {
    if (!name.startsWith(FIELD_PREFIX) || typeof raw !== "string") continue;
    const key = name.slice(FIELD_PREFIX.length);
    const fileValue = original.get(key);
    if (fileValue === undefined || !sections.has(key.split(".")[0])) continue;

    const value = raw.trim();
    if (value === "") {
      fieldErrors[name] = "Tidak boleh kosong. Pakai “Kembalikan teks asli”.";
    } else if (placeholdersOf(value) !== placeholdersOf(fileValue)) {
      fieldErrors[name] = `Kata di dalam kurung kurawal harus tetap sama: ${placeholdersOf(fileValue).replaceAll(",", " ")}`;
    } else if (value === fileValue) {
      removals.push(key);
    } else {
      upserts.push({ locale, key, value });
    }
  }
  if (Object.keys(fieldErrors).length > 0) return failure("Ada isian yang perlu diperbaiki.", fieldErrors);
  if (upserts.length === 0 && removals.length === 0) return failure("Tidak ada yang berubah.");

  let problem: string | null = null;
  if (locale === "id") {
    // Only fields whose Indonesian actually changed; untouched ones keep any hand-made English or French.
    const { data: saved, error } = await supabase.from(tables.text).select("key, value").eq("locale", "id")
      .in("key", [...upserts.map((row) => row.key), ...removals]);
    if (error) return failure(`Gagal membaca teks yang tersimpan: ${error.message}`);
    const savedValue = new Map((saved as { key: string; value: string }[]).map((row) => [row.key, row.value]));
    const before = (key: string) => savedValue.get(key) ?? original.get(key);

    const reset = removals.filter((key) => before(key) !== original.get(key));
    if (reset.length > 0) {
      const { error: resetError } = await supabase.from(tables.text).delete().in("locale", TRANSLATED).in("key", reset);
      if (resetError) return failure(`Gagal menyimpan teks: ${resetError.message}`);
    }

    const changed = upserts.filter((row) => row.value !== before(row.key));
    try {
      for (const target of TRANSLATED) {
        const translations = await translateFromIndonesian(
          changed.map((row) => row.value),
          target,
        );
        changed.forEach((row, index) => upserts.push({ locale: target, key: row.key, value: translations[index] }));
      }
    } catch (translationError) {
      problem = translationError instanceof Error ? translationError.message : "layanan terjemahan tidak merespons";
      // Keep the Indonesian; drop any half-done translations so both languages stay as they were.
      upserts.splice(0, upserts.length, ...upserts.filter((row) => row.locale === "id"));
    }
  }

  if (upserts.length > 0) {
    const { error } = await supabase.from(tables.text).upsert(upserts, { onConflict: "locale,key" });
    if (error) return failure(`Gagal menyimpan teks: ${error.message}`);
  }
  if (removals.length > 0) {
    const { error } = await supabase.from(tables.text).delete().eq("locale", locale).in("key", removals);
    if (error) return failure(`Gagal menyimpan teks: ${error.message}`);
  }

  contentChanged(contentTags.text);
  return { ok: true, message: savedMessage("Teks disimpan.", [problem]) };
}
