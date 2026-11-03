import { getDictionary } from "@/i18n/server";

export async function PlanYourVisit() {
  const t = (await getDictionary()).plan;

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <dl className="grid gap-12 md:grid-cols-3">
        {t.facts.map((fact) => (
          <div key={fact.label} className="flex flex-col border-t-2 border-ink pt-5">
            <dt className="order-2 mt-2 text-lg font-medium">{fact.label}</dt>
            <dd className="order-1 text-5xl font-medium whitespace-nowrap tabular-nums">{fact.figure}</dd>
            <dd className="order-3 mt-1.5 max-w-prose text-ink-muted">{fact.detail}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="stay-title" className="mt-24">
        <h2 id="stay-title" className="text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
          {t.stayTitle}
        </h2>
        <ul className="mt-8 grid gap-10 md:grid-cols-3">
          {t.stays.map((item) => (
            <li key={item.nights}>
              <p className="text-lg font-medium text-jade">{item.nights}</p>
              <p className="mt-2 text-ink-muted">{item.plan}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
