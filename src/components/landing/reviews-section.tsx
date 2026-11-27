import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/server";
import { getReviews, getSite } from "@/lib/content/public";
import { loadGoogleReviews, type GoogleReview } from "@/lib/google-reviews";

const SHOWN = 3;
// Google returns its five "most relevant" reviews; the home page shows the good ones among them.
const MIN_STARS = 4;

// Shows the live rating and reviews from the Google Maps listing when GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID
// are set. Without them, or if Google can't be reached, it falls back to the rating in the business settings
// and the quotes edited in the admin panel (PLACEHOLDERS until real ones are copied in).
export async function ReviewsSection() {
  const locale = await getLocale();
  const t = (await getDictionary()).reviews;
  const [google, site] = await Promise.all([loadGoogleReviews(locale), getSite()]);
  const googleReviews = google?.reviews.filter((review) => review.rating >= MIN_STARS).slice(0, SHOWN) ?? [];
  const live = google && googleReviews.length > 0 ? google : null;

  const formatNumber = (value: number, fractionDigits = 0) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(value);

  return (
    <section aria-labelledby="reviews-title">
      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-20">
        <h2 id="reviews-title" className="display text-[1.85rem] sm:text-center sm:text-[clamp(2.25rem,4.5vw,3.5rem)]">
          {t.title}
        </h2>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mt-5 sm:justify-center">
          <span className="label text-[0.95rem]">
            <span aria-hidden="true" className="text-gold">
              ★★★★★
            </span>{" "}
            {live
              ? fill(t.ratingCount, { rating: formatNumber(live.rating, 1), count: formatNumber(live.count) })
              : fill(t.rating, { rating: site.googleRating })}
          </span>
          <a
            href={live?.mapsUrl ?? site.googleReviewsUrl}
            target="_blank"
            rel="noreferrer"
            className="label text-[0.95rem] underline underline-offset-4 hover:no-underline"
          >
            {t.readReviews}
          </a>
        </p>

        <ul className="-mx-5 mt-6 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-8 sm:mt-14 sm:scroll-px-8 sm:gap-4 sm:px-8 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {live ? googleReviews.map((review) => <GoogleReviewCard key={review.id} review={review} t={t} />) : <AdminReviewCards locale={locale} />}
        </ul>
      </div>
    </section>
  );
}

type ReviewsText = Awaited<ReturnType<typeof getDictionary>>["reviews"];

function GoogleReviewCard({ review, t }: { review: GoogleReview; t: ReviewsText }) {
  return (
    <li className="w-[85%] shrink-0 snap-start rounded-3xl bg-cream p-7 sm:w-[60%] sm:p-8 md:w-auto">
      <figure className="flex h-full flex-col justify-between gap-8">
        <div>
          <p className="text-gold" role="img" aria-label={fill(t.stars, { rating: review.rating })}>
            {"★".repeat(review.rating)}
          </p>
          <blockquote className="mt-4 line-clamp-8 text-[1.2rem] leading-[1.5] tracking-[-0.01em]">
            &ldquo;{review.text}&rdquo;
          </blockquote>
        </div>
        <figcaption>
          <span className="block font-medium">
            {review.authorUrl ? (
              <a href={review.authorUrl} target="_blank" rel="noreferrer" className="hover:underline hover:underline-offset-4">
                {review.authorName}
              </a>
            ) : (
              review.authorName
            )}
          </span>
          <span className="label mt-1 block text-ink-muted">
            {[review.when, t.onGoogle, review.translated ? t.translated : null].filter(Boolean).join(" · ")}
          </span>
        </figcaption>
      </figure>
    </li>
  );
}

async function AdminReviewCards({ locale }: { locale: Locale }) {
  const reviews = await getReviews(locale);
  return reviews.slice(0, SHOWN).map((review) => (
    <li key={review.id} className="w-[85%] shrink-0 snap-start rounded-3xl bg-cream p-7 sm:w-[60%] sm:p-8 md:w-auto">
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
  ));
}
