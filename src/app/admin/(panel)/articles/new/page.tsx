import type { Metadata } from "next";

import { ArticleForm } from "@/app/admin/(panel)/articles/article-form";
import { PageBody, PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = { title: "Artikel baru" };

export default function NewArticlePage() {
  return (
    <>
      <PageHeader title="Artikel baru" parent={{ href: "/admin/articles", title: "Artikel" }} />
      <PageBody>
        <ArticleForm article={null} coverPreview={null} photos={[]} />
      </PageBody>
    </>
  );
}
