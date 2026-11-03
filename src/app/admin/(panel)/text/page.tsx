import type { Metadata } from "next";
import Link from "next/link";

import { textSections } from "@/app/admin/(panel)/text/sections";
import { TextForm } from "@/app/admin/(panel)/text/text-form";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { hasLocale, localeNames, type Locale } from "@/i18n/config";
import { dictionaries } from "@/i18n/server";
import { textEntries } from "@/i18n/text-paths";
import { adminTextOverrides } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Website text" };

export default async function TextPage({ searchParams }: PageProps<"/admin/text">) {
  const { section: sectionParam, lang } = await searchParams;
  const section = textSections.find((candidate) => candidate.key === sectionParam) ?? textSections[0];
  // The client writes in Indonesian; English and French follow by translation.
  const locale: Locale = typeof lang === "string" && hasLocale(lang) ? lang : "id";

  const [dictionary, indonesian, overrides] = await Promise.all([dictionaries[locale](), dictionaries.id(), adminTextOverrides()]);
  const indonesianByKey = new Map(textEntries(indonesian).map((entry) => [entry.key, entry.value]));
  const fields = textEntries(dictionary)
    .filter((entry) => entry.key.startsWith(`${section.key}.`))
    .map((entry) => ({
      key: entry.key,
      original: entry.value,
      saved: overrides[locale][entry.key] ?? null,
      indonesian: locale === "id" ? null : (overrides.id[entry.key] ?? indonesianByKey.get(entry.key) ?? null),
    }));
  const editedCount = (sectionKey: string) =>
    Object.keys(overrides[locale]).filter((key) => key.startsWith(`${sectionKey}.`)).length;
  const href = (sectionKey: string, targetLocale: Locale) => `/admin/text?section=${sectionKey}&lang=${targetLocale}`;

  return (
    <>
      <PageHeader title="Website text" />
      <PageBody width="max-w-5xl">
        <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
          Headings, buttons and sentences around the site. Packages, reviews and questions have their own pages. Words in
          curly brackets, like {"{price}"}, are filled in by the website: keep them as they are.
        </p>
        <div className="grid gap-6 md:grid-cols-[13rem_1fr]">
          <nav aria-label="Sections" className="md:sticky md:top-0 md:self-start">
            <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
              {textSections.map((candidate) => (
                <li key={candidate.key} className="shrink-0">
                  <Link
                    href={href(candidate.key, locale)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-accent",
                      candidate.key === section.key && "bg-accent font-medium",
                    )}
                  >
                    {candidate.title}
                    {editedCount(candidate.key) > 0 ? (
                      <span className="text-[11px] text-muted-foreground">{editedCount(candidate.key)} edited</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <h2 className="text-base font-semibold">{section.title}</h2>
                <p className="text-sm text-muted-foreground">{section.where}</p>
              </div>
              <div className="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground">
                {(["id", "en", "fr"] as const).map((candidate) => (
                  <Link
                    key={candidate}
                    href={href(section.key, candidate)}
                    className={cn(
                      "rounded-md px-3 py-1 text-[13px] font-medium",
                      candidate === locale && "bg-background text-foreground shadow",
                    )}
                  >
                    {localeNames[candidate]}
                  </Link>
                ))}
              </div>
            </div>
            <p className="mb-5 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              {locale === "id"
                ? "Saving a change here also translates it into English and French."
                : "Translated from the Indonesian. Edit here only to correct a translation; it's replaced when the Indonesian changes."}
            </p>
            <TextForm key={`${section.key}-${locale}`} locale={locale} section={section.key} fields={fields} />
          </div>
        </div>
      </PageBody>
    </>
  );
}
