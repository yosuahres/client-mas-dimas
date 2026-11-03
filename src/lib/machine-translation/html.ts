// Text is sent to Google Translate as HTML so the site's {placeholders} can be marked translate="no"
// and line breaks survive. These convert to that HTML and back. Pure, so they're easy to test.

const PLACEHOLDER = /\{\w+\}/g;

/** The {placeholders} in a text, sorted, e.g. "{price},{tour}". Translation must keep them all. */
export function placeholdersOf(text: string) {
  return (text.match(PLACEHOLDER) ?? []).toSorted().join(",");
}

export function toTranslatableHtml(text: string) {
  return text
    .replaceAll("\r\n", "\n")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(PLACEHOLDER, (placeholder) => `<span translate="no">${placeholder}</span>`)
    .replaceAll("\n", "<br>");
}

const namedEntities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function fromTranslatedHtml(html: string) {
  return html
    .replace(/\s*<br\s*\/?>\s*/gi, "\n")
    .replace(/<\/?span[^>]*>/gi, "")
    .replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (entity, code: string) => {
      if (code[0] === "#") {
        const point = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return String.fromCodePoint(point);
      }
      return namedEntities[code.toLowerCase()] ?? entity;
    })
    // Google adds spaces next to the tags around placeholders and line breaks.
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trim())
    .join("\n")
    .trim();
}
