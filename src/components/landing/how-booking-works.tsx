import { getDictionary } from "@/i18n/server";

export async function HowBookingWorks() {
  const t = (await getDictionary()).booking;

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <ol className="grid gap-12 md:grid-cols-3 md:gap-12">
        {t.steps.map((step, index) => (
          <li key={step.title} className="flex gap-5">
            <span className="text-6xl leading-none font-medium text-jade tabular-nums" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h2 className="text-xl font-medium">{step.title}</h2>
              <p className="mt-2 text-ink-muted">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
