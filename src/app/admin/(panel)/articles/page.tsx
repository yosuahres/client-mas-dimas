import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ItemList } from "@/components/admin/item-list";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { adminArticles } from "@/lib/admin/queries";
import { formatArticleDate } from "@/lib/article-body";
import { translateFields } from "@/lib/content/translate";
import { photoUrl } from "@/lib/photos";

export const metadata: Metadata = { title: "Artikel" };

export default async function ArticlesAdminPage() {
  const articles = await adminArticles();

  return (
    <>
      <PageHeader
        title="Artikel"
        actions={
          articles === null ? null : (
            <Button asChild size="sm">
              <Link href="/admin/articles/new">
                <Plus />
                Artikel baru
              </Link>
            </Button>
          )
        }
      />
      <PageBody>
        {articles === null ? (
          <p className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Jalankan <code>supabase/migrations/20261127000000_gallery_and_articles.sql</code> di SQL Editor Supabase supaya artikel bisa ditulis.
          </p>
        ) : (
          <>
            <ItemList
              list="articles"
              reorderable={false}
              emptyText="Belum ada artikel. Tulis artikel pertama."
              items={articles.map((article) => {
                const cover = photoUrl(article.cover);
                const title = translateFields(article.text, "id").title;
                return {
                  key: article.slug,
                  label: title,
                  published: article.published,
                  href: `/admin/articles/${article.slug}`,
                  content: (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail */}
                        {cover ? <img src={cover} alt="" className="size-full object-cover" /> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-sm font-medium sm:line-clamp-1">{title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatArticleDate(article.publishedOn, "id")}
                          {article.photos.length > 0 ? ` · ${article.photos.length} foto` : ""}
                        </p>
                      </div>
                    </div>
                  ),
                };
              })}
            />
          </>
        )}
      </PageBody>
    </>
  );
}
