import Image from "next/image";
import Link from "next/link";

import batik from "@/assets/photos/batik.jpg";
import { ArrowRightIcon } from "@/components/icons";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";

// From 640px: a big photo feature in a rounded frame, with the promise on top of it.
// Phones: a short photo, then the text on white underneath, so the copy isn't buried in one tall image card.
export async function GuidesSection() {
  const locale = await getLocale();
  const t = (await getDictionary()).guides;

  return (
    <section aria-labelledby="guides-title" className="px-3">
      <div className="relative isolate mx-auto max-w-[90rem] sm:overflow-hidden sm:rounded-3xl sm:bg-ink sm:text-white">
        <div className="relative h-48 overflow-hidden rounded-2xl bg-ink sm:absolute sm:inset-0 sm:-z-10 sm:h-auto sm:rounded-none">
          <Image src={batik} alt={t.photoAlt} placeholder="blur" fill sizes="100vw" className="object-cover object-[50%_35%]" />
          <div className="absolute inset-0 hidden bg-linear-to-r from-black/75 via-black/40 to-black/5 sm:block" />
        </div>

        <div className="px-2 pt-6 sm:px-12 sm:py-32 lg:px-20 lg:py-40">
          <div className="max-w-xl">
            <p className="kicker text-ink-muted sm:text-white/80">{t.kicker}</p>
            <h2 id="guides-title" className="display mt-2 text-[clamp(2.25rem,5vw,4rem)] sm:mt-3">
              {t.title}
            </h2>
            <p className="mt-4 text-[1.05rem] leading-[1.6] text-ink-muted sm:mt-6 sm:text-[1.1rem] sm:text-white/85">{t.lede}</p>
            <ul className="mt-5 flex flex-wrap gap-2 sm:mt-7">
              {t.included.map((item) => (
                <li key={item} className="rounded-full bg-cream px-3.5 py-1.5 text-[0.9rem] sm:bg-white/15 sm:backdrop-blur-sm">
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={localePath(locale, "/how-to-book")}
              className="pill mt-7 bg-jade text-white hover:bg-jade/90 sm:mt-9 sm:bg-white sm:text-ink sm:hover:bg-white/90"
            >
              {t.cta}
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
