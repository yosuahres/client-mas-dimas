import type { Metadata } from "next";

import { textSections } from "@/app/admin/(panel)/text/sections";
import { TextEditor, type TextField } from "@/app/admin/(panel)/text/text-form";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { hasLocale, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/server";
import { textEntries } from "@/i18n/text-paths";
import { adminTextOverrides } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Website text" };

export default async function TextPage({ searchParams }: PageProps<"/admin/text">) {
  const { lang } = await searchParams;
  // The client writes in Indonesian; English and French follow by translation and are only opened to fix one.
  const locale: Locale = typeof lang === "string" && hasLocale(lang) ? lang : "id";

  const [dictionary, indonesian, overrides] = await Promise.all([dictionaries[locale](), dictionaries.id(), adminTextOverrides()]);
  const indonesianByKey = new Map(textEntries(indonesian).map((entry) => [entry.key, entry.value]));
  const sectionKeys = new Set<string>(textSections.map((section) => section.key));

  const fields: TextField[] = textEntries(dictionary)
    .filter((entry) => sectionKeys.has(entry.key.split(".")[0]))
    .map((entry) => ({
      key: entry.key,
      original: entry.value,
      saved: overrides[locale][entry.key] ?? null,
      indonesian: locale === "id" ? null : (overrides.id[entry.key] ?? indonesianByKey.get(entry.key) ?? null),
    }));

  return (
    <>
      <PageHeader title="Website text" />
      <PageBody>
        <TextEditor key={locale} locale={locale} fields={fields} />
      </PageBody>
    </>
  );
}
