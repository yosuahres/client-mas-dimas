import Image from "next/image";
import Link from "next/link";

import batik from "@/assets/photos/batik.jpg";
import { ArrowRightIcon } from "@/components/icons";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/server";

// A big photo feature in a rounded frame, with the promise on top of it.
export async function GuidesSection() {
  const locale = await getLocale();
  const t = (await getDictionary()).guides;

  return (
    <section aria-labelledby="guides-title" className="px-3">
      <div className="relative isolate mx-auto max-w-[90rem] overflow-hidden rounded-3xl bg-ink text-white">
        <Image src={batik} alt={t.photoAlt} placeholder="blur" fill sizes="100vw" className="-z-10 object-cover object-[50%_35%]" />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/75 via-black/40 to-black/5" />

        <div className="px-6 py-24 sm:px-12 sm:py-32 lg:px-20 lg:py-40">
          <div className="max-w-xl">
            <p className="kicker text-white/80">{t.kicker}</p>
            <h2 id="guides-title" className="display mt-3 text-[clamp(2.5rem,5vw,4rem)]">
              {t.title}
            </h2>
            <p className="mt-6 text-[1.1rem] leading-[1.6] text-white/85">{t.lede}</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {t.included.map((item) => (
                <li key={item.title} className="rounded-full bg-white/15 px-3.5 py-1.5 text-[0.9rem] backdrop-blur-sm">
                  {item.title}
                </li>
              ))}
            </ul>
            <Link href={localePath(locale, "/how-to-book")} className="pill mt-9 bg-white text-ink hover:bg-white/90">
              {t.cta}
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
