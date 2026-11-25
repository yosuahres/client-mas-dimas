"use client";

import { RotateCcw, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { saveText } from "@/app/admin/(panel)/text/actions";
import { textPages, textSections, type TextPageKey } from "@/app/admin/(panel)/text/sections";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export type TextField = {
  key: string;
  /** The text in the dictionary file. */
  original: string;
  /** The saved edit, if any. */
  saved: string | null;
  /** The Indonesian it's translated from, shown under English and French fields. */
  indonesian: string | null;
};

const languages: { locale: Locale; name: string }[] = [
  { locale: "id", name: "Indonesian" },
  { locale: "en", name: "English" },
  { locale: "fr", name: "French" },
];

const whatsappMessage = "WhatsApp message (filled in for the visitor)";

// Plain names for the words used in the dictionary files.
const names: Record<string, string> = {
  title: "Heading",
  kicker: "Small line above the heading",
  lede: "Text under the heading",
  intro: "Text under the heading",
  body: "Text",
  cta: "Button",
  button: "Button",
  link: "Link text",
  after: "Text after the link",
  prompt: "Question",
  detail: "Details",
  metaDescription: "Description on Google",
  photoAlt: "Photo description (read aloud to blind visitors)",
  message: whatsappMessage,
  chatMessage: whatsappMessage,
  planMessage: whatsappMessage,
  nav: "Menu",
  faq: "Questions",
  tiles: "Tile",
  facts: "Fact",
  steps: "Step",
  left: "Left text",
  right: "Right text",
  sticker: "Sticker line",
  columns: "Column heading",
  seeTours: "Button: see tours",
  planOnWhatsapp: "Button: plan on WhatsApp",
};

function humanize(word: string) {
  const spaced = word.replace(/([A-Z])/g, " $1").replace(/-/g, " ").trim().toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function nameOf(word: string) {
  if (names[word]) return names[word];
  if (/^message[A-Z]/.test(word)) return `WhatsApp message: ${humanize(word.slice("message".length)).toLowerCase()}`;
  if (/Message$/.test(word)) return `${humanize(word.slice(0, -"Message".length))}: WhatsApp message`;
  return humanize(word);
}

/** "plan.facts.0.label" → "Facts #1 · Label" (the section is already the card's title). */
export function fieldLabel(key: string) {
  const parts: string[] = [];
  for (const part of key.split(".").slice(1)) {
    if (/^\d+$/.test(part) && parts.length > 0) parts[parts.length - 1] += ` #${Number(part) + 1}`;
    else parts.push(nameOf(part));
  }
  return parts.join(" · ");
}

export function TextEditor({ locale, fields }: { locale: Locale; fields: TextField[] }) {
  const { onSubmit, pending, fieldErrors: errors } = useAdminForm(saveText.bind(null, locale));
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.key, field.saved ?? field.original])),
  );
  const [page, setPage] = useState<TextPageKey>(textPages[0].key);
  const [query, setQuery] = useState("");

  const bySection = useMemo(
    () => new Map(textSections.map((section) => [section.key, fields.filter((field) => field.key.startsWith(`${section.key}.`))])),
    [fields],
  );
  const baseline = (field: TextField) => field.saved ?? field.original;
  const unsaved = fields.filter((field) => values[field.key] !== baseline(field));

  const search = query.trim().toLowerCase();
  const matches = (field: TextField) =>
    [values[field.key], field.original, field.indonesian ?? "", fieldLabel(field.key)].some((text) => text.toLowerCase().includes(search));
  const shown = textSections
    .filter((section) => (search ? true : section.page === page))
    .map((section) => ({ section, fields: (bySection.get(section.key) ?? []).filter((field) => !search || matches(field)) }))
    .filter((group) => group.fields.length > 0);

  const setValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const discard = () => setValues(Object.fromEntries(fields.map((field) => [field.key, baseline(field)])));
  const errorList = Object.entries(errors).map(([name, message]) => ({ key: name.slice("text:".length), message }));

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find words on the website"
            aria-label="Find text"
            className="pl-9"
          />
        </div>
        <div className="ml-auto flex items-center gap-2 text-[13px]">
          <span className="text-muted-foreground">Language:</span>
          <div className="inline-flex rounded-lg bg-muted p-1">
            {languages.map((language) => (
              <Link
                key={language.locale}
                href={language.locale === "id" ? "/admin/text" : `/admin/text?lang=${language.locale}`}
                className={cn(
                  "rounded-md px-3 py-2 font-medium text-muted-foreground md:py-1",
                  language.locale === locale && "bg-background text-foreground shadow",
                )}
              >
                {language.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <p
        className={cn(
          "rounded-lg px-4 py-3 text-sm",
          locale === "id" ? "bg-muted text-muted-foreground" : "bg-amber-50 text-amber-900",
        )}
      >
        {locale === "id" ? (
          <>
            Change the words, then press <strong>Save</strong>. English and French are translated for you. Keep words in curly
            brackets, like {"{price}"}, exactly as they are: the website fills them in.
          </>
        ) : (
          <>
            You&apos;re fixing the {locale === "en" ? "English" : "French"} translation. It&apos;s made from the Indonesian
            automatically, so only change it if it&apos;s wrong. Your fix stays until that Indonesian text changes.
          </>
        )}
      </p>

      {search ? (
        <div className="flex items-center gap-2 text-sm">
          <span>
            Showing text with <strong>“{query.trim()}”</strong> on every page.
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setQuery("")}>
            <X />
            Clear
          </Button>
        </div>
      ) : (
        <div
          role="tablist"
          aria-label="Part of the website"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          {textPages.map((candidate) => (
            <button
              key={candidate.key}
              type="button"
              role="tab"
              aria-selected={candidate.key === page}
              onClick={() => setPage(candidate.key)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:py-1.5",
                candidate.key === page ? "border-foreground bg-foreground text-background" : "hover:bg-accent",
              )}
            >
              {candidate.title}
            </button>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <p className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">No text found with “{query.trim()}”.</p>
      ) : (
        shown.map(({ section, fields: sectionFields }) => (
          <section key={section.key} className="rounded-xl border">
            <div className="border-b px-4 py-3">
              <h2 className="text-sm font-semibold">{section.title}</h2>
              <p className="text-xs text-muted-foreground">{section.where}</p>
            </div>
            <div className="grid gap-5 p-4">
              {sectionFields.map((field) => (
                <TextRow
                  key={field.key}
                  field={field}
                  value={values[field.key]}
                  unsaved={values[field.key] !== baseline(field)}
                  error={errors[`text:${field.key}`]}
                  onChange={(value) => setValue(field.key, value)}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {/* Only changed fields are sent, wherever they are in the tabs. */}
      {unsaved.map((field) => (
        <input key={field.key} type="hidden" name={`text:${field.key}`} value={values[field.key]} />
      ))}

      <div className="sticky -bottom-4 -mx-4 -mb-4 grid gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-bottom-6 sm:-mx-6 sm:-mb-6 sm:px-6">
        {errorList.length > 0 ? (
          <ul className="grid gap-0.5 text-xs text-destructive">
            {errorList.map((error) => (
              <li key={error.key}>
                <strong>{fieldLabel(error.key)}</strong>: {error.message}
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex items-center justify-end gap-2">
          <span className="mr-auto min-w-0 text-sm text-muted-foreground">
            {unsaved.length === 0 ? (
              "No changes"
            ) : (
              <>
                {unsaved.length} change{unsaved.length === 1 ? "" : "s"}
                <span className="hidden sm:inline"> not saved yet</span>
              </>
            )}
          </span>
          {unsaved.length > 0 ? (
            <Button type="button" variant="ghost" onClick={discard} disabled={pending}>
              Undo<span className="hidden sm:inline"> changes</span>
            </Button>
          ) : null}
          <Button type="submit" disabled={pending || unsaved.length === 0}>
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}

type TextRowProps = {
  field: TextField;
  value: string;
  unsaved: boolean;
  error?: string;
  onChange: (value: string) => void;
};

function TextRow({ field, value, unsaved, error, onChange }: TextRowProps) {
  const id = `text-${field.key}`;

  return (
    <div className="grid gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={id} className="text-[13px]">
          {fieldLabel(field.key)}
        </Label>
        {unsaved ? <span className="rounded bg-amber-100 px-1.5 text-[11px] text-amber-900">Not saved yet</span> : null}
        {value !== field.original ? (
          <button
            type="button"
            onClick={() => onChange(field.original)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3" />
            Back to original
          </button>
        ) : null}
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={Math.min(6, Math.max(1, Math.ceil(value.length / 110)))}
        aria-invalid={error ? true : undefined}
        className="min-h-9 resize-y"
      />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : field.indonesian ? (
        <p className="text-xs text-muted-foreground">From the Indonesian: {field.indonesian}</p>
      ) : null}
    </div>
  );
}
