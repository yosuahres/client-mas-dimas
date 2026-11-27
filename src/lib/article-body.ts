import { intlLocale, type Locale } from "@/i18n/config";

// An article's body is plain text the client types in the admin panel, so it needs no editor and survives machine
// translation: a blank line starts a new paragraph, a line starting "## " is a heading and lines starting "- " are a
// bulleted list. Anything else is kept as written.

export type ArticleBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; lines: string[] }
  | { kind: "list"; items: string[] };

export function parseArticleBody(body: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  let current: ArticleBlock | null = null;

  for (const raw of body.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      current = null;
      continue;
    }
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      blocks.push({ kind: "heading", text: heading[1] });
      current = null;
      continue;
    }
    const item = line.match(/^[-•*–]\s+(.+)$/);
    if (item) {
      if (current?.kind !== "list") {
        current = { kind: "list", items: [] };
        blocks.push(current);
      }
      current.items.push(item[1]);
      continue;
    }
    if (current?.kind !== "paragraph") {
      current = { kind: "paragraph", lines: [] };
      blocks.push(current);
    }
    current.lines.push(line);
  }
  return blocks;
}

/** "2026-11-27" → "27 November 2026", in the reader's language. */
export function formatArticleDate(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}
