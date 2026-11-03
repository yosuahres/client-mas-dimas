import { getDictionary, getLocale } from "@/i18n/server";
import { getFaqs, getSite } from "@/lib/content/public";
import { whatsappLink } from "@/lib/site";

export async function FaqSection() {
  const locale = await getLocale();
  const t = (await getDictionary()).faq;
  const [faqs, site] = await Promise.all([getFaqs(locale), getSite()]);

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-12 lg:gap-16">
      <div className="divide-y divide-sand border-y border-sand lg:col-span-8">
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

      <aside className="lg:col-span-4">
        <p className="text-lg font-medium">{t.anythingElse}</p>
        <p className="mt-2 text-ink-muted">
          <a href={whatsappLink(site, t.message)} className="font-medium text-ink underline underline-offset-4">
            {t.link}
          </a>
          {t.after}
        </p>
      </aside>
    </div>
  );
}
