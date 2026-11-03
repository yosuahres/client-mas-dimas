// The title block at the top of every inner page: a rounded green panel with a large, calm headline.
export function PageHeader({ title, lede }: { title: string; lede: string }) {
  return (
    <section aria-labelledby="page-title" className="px-3 pt-3">
      <div className="mx-auto max-w-[90rem] rounded-3xl bg-jade text-white">
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-20">
          <h1 id="page-title" className="display text-[clamp(3rem,7vw,5.5rem)]">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-lede text-white/85">{lede}</p>
        </div>
      </div>
    </section>
  );
}
