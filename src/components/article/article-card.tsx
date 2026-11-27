import Image from "next/image";
import Link from "next/link";

import { localePath, type Locale } from "@/i18n/config";
import { formatArticleDate } from "@/lib/article-body";
import type { Article } from "@/lib/content/public";

// One article in a list: its photo, date, title and excerpt. The whole card is one link.
export function ArticleCard({ article, locale }: { article: Article; locale: Locale }) {
  return (
    <article className="group relative">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-sand">
        {article.cover ? (
          <Image
            src={article.cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <p className="mt-4 text-[0.9rem] text-ink-muted">
        <time dateTime={article.publishedOn}>{formatArticleDate(article.publishedOn, locale)}</time>
      </p>
      <h3 className="mt-1.5 text-[1.35rem] leading-[1.25] font-normal tracking-[-0.02em]">
        <Link href={localePath(locale, `/articles/${article.slug}`)} className="after:absolute after:inset-0 group-hover:underline group-hover:underline-offset-4">
          {article.title}
        </Link>
      </h3>
      {article.excerpt ? <p className="mt-2 line-clamp-3 text-ink-muted">{article.excerpt}</p> : null}
    </article>
  );
}

// The newest article at the top of the list: a big photo beside its title and summary, stacked on phones.
export function FeaturedArticle({ article, locale, readMore }: { article: Article; locale: Locale; readMore: string }) {
  return (
    <article className="group relative grid items-center gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12">
      <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-sand md:aspect-3/2">
        {article.cover ? (
          <Image
            src={article.cover}
            alt=""
            priority
            fill
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : null}
      </div>
      <div>
        <p className="text-ink-muted">
          <time dateTime={article.publishedOn}>{formatArticleDate(article.publishedOn, locale)}</time>
        </p>
        <h2 className="display mt-3 text-[clamp(2rem,3.6vw,3rem)]">
          <Link href={localePath(locale, `/articles/${article.slug}`)} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </h2>
        {article.excerpt ? <p className="mt-4 text-[1.1rem] leading-[1.6] text-ink-muted">{article.excerpt}</p> : null}
        <p className="mt-6 inline-flex font-medium text-jade group-hover:underline group-hover:underline-offset-4">
          {readMore}
        </p>
      </div>
    </article>
  );
}
