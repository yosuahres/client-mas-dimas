import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article/article-card";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { languageAlternates, localePath, ogLocale } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";
import { formatArticleDate, parseArticleBody } from "@/lib/article-body";
import { getArticle, getArticles, getSite } from "@/lib/content/public";
import { articleJsonLd, jsonLdScript } from "@/lib/structured-data";

// Like the package pages: articles published at build time are prerendered, later ones render on their first visit
// and are cached from then on, and an unknown slug still answers with a real 404.
export const ensureStatic = "navigation";

export async function generateStaticParams() {
  const articles = await getArticles("en");
  // At least one param, or the build can't check the page; it 404s.
  return articles.length > 0 ? articles.map((article) => ({ slug: article.slug })) : [{ slug: "none" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const [article, site] = await Promise.all([getArticle(locale, slug), getSite()]);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: languageAlternates(locale, `/articles/${article.slug}`),
    // Set whole, because a page's openGraph replaces the layout's
    openGraph: {
      type: "article",
      siteName: site.businessName,
      locale: ogLocale[locale],
      publishedTime: article.publishedOn,
      ...(article.cover && { images: [article.cover] }),
    },
    // The samples shown before the first real article stay out of search engines
    ...(article.sample && { robots: { index: false, follow: true } }),
  };
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/articles/[slug]">) {
  const { slug } = await params;
  const locale = await getLocale();
  const dict = await getDictionary();
  const t = dict.articles;
  const [articles, site] = await Promise.all([getArticles(locale), getSite()]);
  const article = articles.find((candidate) => candidate.slug === slug);
  if (!article) notFound();
  const jsonLd = articleJsonLd({ site, locale, article, listName: t.title });

  const others = articles.filter((other) => other.slug !== article.slug).slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <SiteHeader path={`/articles/${article.slug}`} />
      <main>
        <article>
          <header className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-16">
            <Link href={localePath(locale, "/articles")} className="inline-flex items-center gap-2 text-[0.95rem] text-ink-muted hover:text-ink">
              {t.allArticles}
            </Link>
            <p className="mt-8 text-ink-muted">
              <time dateTime={article.publishedOn}>{formatArticleDate(article.publishedOn, locale)}</time>
            </p>
            <h1 className="display mt-3 text-[clamp(2.25rem,5vw,3.75rem)]">{article.title}</h1>
          </header>

          {article.cover ? (
            <div className="mx-auto mt-10 max-w-5xl sm:px-8">
              <div className="relative aspect-3/2 overflow-hidden bg-sand sm:rounded-3xl">
                <Image src={article.cover} alt="" priority fill sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" />
              </div>
            </div>
          ) : null}

          <div className="mx-auto max-w-3xl px-5 pt-10 pb-16 sm:px-8 sm:pt-14 sm:pb-24">
            <ArticleBody body={article.body} />
          </div>

          {article.photos.length > 0 ? (
            <section aria-labelledby="article-photos" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
              <h2 id="article-photos" className="mb-6 text-2xl font-medium tracking-[-0.03em]">
                {t.photos}
              </h2>
              <PhotoGrid
                photos={article.photos.map((url, index) => ({ id: `${index}`, url, caption: "" }))}
                text={dict.gallery}
                fallbackAlt={article.title}
              />
            </section>
          ) : null}
        </article>

        {others.length > 0 ? (
          <section aria-labelledby="more-articles" className="border-t border-sand">
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
              <h2 id="more-articles" className="text-3xl font-medium tracking-[-0.03em]">
                {t.more}
              </h2>
              <ul className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((other) => (
                  <li key={other.slug}>
                    <ArticleCard article={other} locale={locale} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}

function ArticleBody({ body }: { body: string }) {
  return (
    <div className="grid gap-5 text-[1.125rem] leading-[1.7]">
      {parseArticleBody(body).map((block, index) => {
        if (block.kind === "heading") {
          return (
            <h2 key={index} className="mt-6 text-[1.6rem] leading-tight font-medium tracking-[-0.02em]">
              {block.text}
            </h2>
          );
        }
        if (block.kind === "list") {
          return (
            <ul key={index} className="grid list-disc gap-1.5 pl-6 marker:text-jade">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
