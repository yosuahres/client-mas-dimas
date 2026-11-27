import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleForm } from "@/app/admin/(panel)/articles/article-form";
import { PageBody, PageHeader } from "@/components/admin/page-header";
import { adminArticle } from "@/lib/admin/queries";
import { translateFields } from "@/lib/content/translate";
import { photoUrl } from "@/lib/photos";

export const metadata: Metadata = { title: "Ubah artikel" };

export default async function EditArticlePage({ params }: PageProps<"/admin/articles/[slug]">) {
  const { slug } = await params;
  const article = await adminArticle(slug);
  if (!article) notFound();

  return (
    <>
      <PageHeader title={translateFields(article.text, "id").title} parent={{ href: "/admin/articles", title: "Artikel" }} />
      <PageBody>
        <ArticleForm
          key={article.slug}
          article={article}
          coverPreview={photoUrl(article.cover)}
          photos={article.photos.map((photo) => ({ key: photo, preview: photoUrl(photo) ?? "" }))}
        />
      </PageBody>
    </>
  );
}
