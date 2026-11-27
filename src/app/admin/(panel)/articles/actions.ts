"use server";


import { databaseFailure, failure, invalid, type ActionResult } from "@/lib/admin/action-result";
import { savedMessage, translateDraft } from "@/lib/admin/auto-translate";
import { formObject } from "@/lib/admin/form-data";
import { contentChanged, discardPhoto, newKey } from "@/lib/admin/mutations";
import { articleInput, completeArticleText } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/admin/session";
import { articleToRow, tables, type ArticleRow } from "@/lib/content/rows";
import { contentTags } from "@/lib/content/store";

/** Creates an article (slug null) or updates one. A new article's web address comes from its English title. */
export async function saveArticle(slug: string | null, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = articleInput.safeParse(formObject(formData));
  if (!parsed.success) return invalid(parsed.error);

  const { data: before } =
    slug === null
      ? { data: null }
      : await supabase.from(tables.articles).select("text, cover, photos").eq("slug", slug).maybeSingle<Pick<ArticleRow, "text" | "cover" | "photos">>();
  if (slug !== null && !before) return failure("Artikel ini sudah tidak ada. Mungkin sudah dihapus di tab lain.");

  const text = await translateDraft(parsed.data.text, before?.text, completeArticleText, "text");
  if (!text.ok) return text.result;
  const articleSlug = slug ?? (await newKey(tables.articles, "slug", text.value.en.title || parsed.data.text.id.title, "artikel"));
  const row = articleToRow({ ...parsed.data, slug: articleSlug, text: text.value });

  const { error } = slug === null ? await supabase.from(tables.articles).insert(row) : await supabase.from(tables.articles).update(row).eq("slug", slug);
  if (error) return databaseFailure(error, "artikel");

  // Photos taken out of the article are deleted from storage.
  if (before) {
    const kept = new Set([row.cover, ...row.photos]);
    await Promise.all([before.cover, ...before.photos].filter((photo) => photo && !kept.has(photo)).map(discardPhoto));
  }

  contentChanged(contentTags.articles);
  return {
    ok: true,
    message: savedMessage("Artikel disimpan.", [text.problem]),
    redirectTo: slug === null ? `/admin/articles/${articleSlug}` : undefined,
  };
}
