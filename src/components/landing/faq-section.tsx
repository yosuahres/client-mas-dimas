import { getLocale } from "@/i18n/server";
import { getFaqs } from "@/lib/content/public";

export async function FaqSection() {
  const locale = await getLocale();
  const faqs = await getFaqs(locale);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="divide-y divide-sand border-y border-sand">
        {faqs.map((item) => (
          <details key={item.id} className="group">
            <summary className="flex cursor-pointer items-start justify-between gap-6 py-5 text-lg font-medium">
              <h2>{item.question}</h2>
              <span
                aria-hidden="true"
                className="disclosure-icon mt-1 text-2xl leading-none font-light text-jade transition-transform duration-200"
              >
                +
              </span>
            </summary>
            <p className="max-w-prose pb-6 text-ink-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
