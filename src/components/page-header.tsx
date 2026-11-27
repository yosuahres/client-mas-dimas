import Image from "next/image";
import type { ReactNode } from "react";

type Band = "peach" | "wheat" | "ink";

type PageHeaderProps = {
  title: string;
  /**
   * How the title block looks, so each inner page has its own:
   * - a band: a rounded panel in that colour, inset from 640px and edge to edge on phones
   * - photo: a rounded photo banner with the title over a dark fade
   * - plain: the title on white over a hairline, for pages whose content is the picture (Gallery, Articles)
   */
  look: Band | "photo" | "plain";
  photo?: { src: string; alt: string } | null;
  /** Centres the title in a band. */
  centered?: boolean;
  /** Plain only: shown at the right of the title, e.g. how many photos there are. */
  aside?: ReactNode;
};

const bands: Record<Band, string> = {
  peach: "bg-peach text-ink",
  wheat: "bg-wheat text-ink",
  ink: "bg-ink text-white",
};

const titleClass = "display text-[clamp(2.75rem,7vw,5.5rem)]";

// The title block at the top of every inner page, in the look that page asks for.
export function PageHeader({ title, look, photo, centered = false, aside }: PageHeaderProps) {
  if (look === "plain") {
    return (
      <section aria-labelledby="page-title" className="mx-auto max-w-7xl px-5 pt-10 sm:px-8 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-ink/10 pb-6 sm:pb-8">
          <h1 id="page-title" className={titleClass}>
            {title}
          </h1>
          {aside ? <p className="text-ink-muted sm:pb-2">{aside}</p> : null}
        </div>
      </section>
    );
  }

  if (look === "photo" && photo) {
    return (
      <section aria-labelledby="page-title" className="sm:px-3 sm:pt-3">
        <div className="relative isolate mx-auto flex h-64 max-w-[90rem] items-end overflow-hidden bg-ink text-white sm:h-[26rem] sm:rounded-3xl">
          <Image src={photo.src} alt={photo.alt} priority fill sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <div className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8 sm:pb-12">
            <h1 id="page-title" className={titleClass}>
              {title}
            </h1>
          </div>
        </div>
      </section>
    );
  }

  const band = look === "photo" ? "ink" : look;
  return (
    <section aria-labelledby="page-title" className="sm:px-3 sm:pt-3">
      <div className={`mx-auto max-w-[90rem] sm:rounded-3xl ${bands[band]}`}>
        <div className={`mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 ${centered ? "text-center" : ""}`}>
          <h1 id="page-title" className={titleClass}>
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
