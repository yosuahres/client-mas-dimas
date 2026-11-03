import { fill } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { getReviews, getSite } from "@/lib/content/public";

// The rating is the client's real Google rating. The quotes are edited in the admin panel; the ones the site
// launched with are PLACEHOLDERS: replace them with real Google reviews before the site goes live.
export async function ReviewsSection() {
  const locale = await getLocale();
  const t = (await getDictionary()).reviews;
  const [reviews, site] = await Promise.all([getReviews(locale), getSite()]);

  return (
    <section aria-labelledby="reviews-title">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <h2 id="reviews-title" className="display text-center text-[clamp(2.25rem,4.5vw,3.5rem)]">
          {t.title}
        </h2>
        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span className="label text-[0.95rem]">
            <span aria-hidden="true" className="text-gold">
              ★★★★★
            </span>{" "}
            {fill(t.rating, { rating: site.googleRating })}
          </span>
          <a href={site.googleReviewsUrl} className="label text-[0.95rem] underline underline-offset-4 hover:no-underline">
            {t.readReviews}
          </a>
        </p>

        <ul className="mt-14 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-3xl bg-cream p-7 sm:p-8">
              <figure className="flex h-full flex-col justify-between gap-8">
                <blockquote className="text-[1.2rem] leading-[1.5] tracking-[-0.01em]">&ldquo;{review.quote}&rdquo;</blockquote>
                <figcaption>
                  <span className="block font-medium">
                    {review.guestName}, {review.origin}
                  </span>
                  {review.tourName ? <span className="label mt-1 block text-ink-muted">{review.tourName}</span> : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
