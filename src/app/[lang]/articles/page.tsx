import type { Metadata } from "next";

import { ArticleCard, FeaturedArticle } from "@/components/article/article-card";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { PageHeader } from "@/components/page-header";

import { getDictionary, getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/page-metadata";
import { getArticles } from "@/lib/content/public";

export async function generateMetadata(): Promise<Metadata> {
  const t = (await getDictionary()).articles;
  return pageMetadata("/articles", t.title, t.metaDescription);
}

export default async function ArticlesPage() {
  const locale = await getLocale();
  const t = (await getDictionary()).articles;
  const [latest, ...rest] = await getArticles(locale);

  return (
    <>
      <SiteHeader path="/articles" />
      <main>
        <PageHeader title={t.title} look="plain" />
        <div className="mx-auto max-w-7xl px-5 pt-8 pb-14 sm:px-8 sm:pt-10 sm:pb-20">
          {latest ? (
            <>
              <FeaturedArticle article={latest} locale={locale} readMore={t.readMore} />
              {rest.length > 0 ? (
                <ul className="mt-12 grid gap-x-6 gap-y-12 border-t border-ink/10 pt-12 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <li key={article.slug}>
                      <ArticleCard article={article} locale={locale} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            <p className="text-ink-muted">{t.empty}</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
